<script>
  import { sortedItems, editorStates } from "../../stores/editor"
  import { getItemById, isAnyParentHidden, setCurrentItemById } from "../../utils/editor"
  import { compile } from "../../utils/compiler"
  import { fade } from "svelte/transition"
  import ExpandableCodeblock from "./ExpandableCodeblock.svelte"

  let active = false
  let found = false
  let value = ""
  let error = ""
  let foundCompiled = {}
  let foundItem = {}
  let lineNumber = 0
  let input

  $: if (active) {
    value = ""
    error = ""
    found = false

    focusInput()
  }

  $: if (value) {
    error = ""
    found = false
  }

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 66) {
      event.preventDefault()
      active = !active
      focusInput()
    }

    if (!active) return

    if (event.keyCode == 13) find() // Enter key
  }

  function find() {
    error = ""

    const content = $sortedItems.filter(i => i.type == "item" && !i.hidden && !isAnyParentHidden(i)).map(i => {
      // Insert line marker to use keep track of line numbers
      return i.content.split("\n").map((line, lineNumber) => `[linemarker]${ i.id }|${ lineNumber + 1 }[/linemarker]${ line }`).join("\n")
    }).join("\n\n")

    try {
      const intValue = Math.max(parseInt(value) - 1, 0)

      if (isNaN(intValue)) throw new Error("That's not a number")

      const compiled = compile(content)
      const splitCompiled = compiled.split("\n")

      if (intValue > splitCompiled.length) throw new Error("Line was not found, are you sure you entered it correctly?")

      // Attempt to find line marker starting at current line moving up
      let linemarkerStart = -1
      let i = intValue
      while (linemarkerStart == -1 && i) {
        linemarkerStart = splitCompiled[i].indexOf("[linemarker]")
        i--
      }

      // Get end of linemarker and split data for item id and line number
      const linemarkerEnd = splitCompiled[i].indexOf("[/linemarker]")
      const linemarkerData = splitCompiled[i].substring(linemarkerStart + "[linemarker]".length, linemarkerEnd)
      const splitLineData = linemarkerData.split("|")
      const itemId = splitLineData[0]
      const item = getItemById(itemId)
      lineNumber = parseInt(splitLineData[1])

      if (!item) throw new Error("Couldn't find a corresponding file.")

      const cleanCompiledLines = compiled.replaceAll(/(\[linemarker].*\[\/linemarker])/g, "").split("\n")
      const cleanItemContentLines = item.content.replaceAll(/(\[linemarker].*\[\/linemarker])/g, "").split("\n")

      // Get data for compiled content, include line before and fter
      foundCompiled = {
        lineNumber: intValue,
        multiline: cleanCompiledLines
      }

      // Get data for original item content, include line before and fter
      foundItem = {
        item,
        lineNumber,
        multiline: cleanItemContentLines
      }

      found = true
    } catch (e) {
      console.error(e)
      error = e
    }
  }

  async function goToItemAndSelect() {
    setCurrentItemById(foundItem.item.id)

    await tick()

    const state = $editorStates[foundItem.item.id]
    if (!state) return

    // Fire event to set selection, captured in CodeMirror.svelte
    const { from, to } = state.doc.line(lineNumber + 1)
    const createSelection = new CustomEvent("create-selection", {
      bubbles: true,
      detail: { from, to }
    })

    document.body.dispatchEvent(createSelection)

    active = false
  }

  async function focusInput() {
    await tick()
    input.focus()
  }
</script>

<svelte:window on:keydown={keydown} on:keydown={event => { if (event.key === "Escape") active = false }} />

<button class="form-input bg-darker text-dark cursor-pointer text-left" on:click={() => active = true}>
  <em>Find line... (Ctrl+B)</em>
</button>

{#if active}
  <div class="modal modal--top" transition:fade={{ duration: 100 }} data-ignore>
    <div class="modal__content" style="max-width: 600px">
      <p class="mt-0">
        <strong class="text-white">Enter the line number you received from an in-game error</strong> and this tool will attempt to find the matching line in the correct file.<br>
        <em>Success not guaranteed.</em>
      </p>

      <div class="flex">
        <input
          type="text"
          class="form-input form-input--large bg-darker"
          placeholder="Find error by line..."
          bind:value
          bind:this={input} />

        <button class="button button--secondary button--square ml-1/8" on:click={find}>Find</button>
      </div>

      {#if error}
        <div class="text-red mt-1/4">{error}</div>
      {/if}

      {#if found}
        <p class="mb-1/8">This is what the line looks like in your compiled code:</p>
        <ExpandableCodeblock
          fullContentLines={foundCompiled.multiline}
          snippetHighlightedLineIndex={foundCompiled.lineNumber}
        />

        <p class="mb-1/8">
          This is what the corresponding line looks like in your code: <br>
          File name: <strong class="text-white">{foundItem.item?.name}</strong>.
        </p>
        <ExpandableCodeblock
          fullContentLines={foundItem.multiline}
          snippetHighlightedLineIndex={foundItem.lineNumber}
        />

        <button class="button mt-1/4" on:click={goToItemAndSelect}>Take me there!</button>
      {/if}
    </div>

    <div class="modal__backdrop" on:click={() => active = false} />
  </div>
{/if}

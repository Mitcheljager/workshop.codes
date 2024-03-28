<script>
  import { items, currentItem, editorStates } from "../../stores/editor"
  import { getItemById, setCurrentItemById, updateItem } from "../../utils/editor"
  import { replaceBetween } from "../../utils/parse"
  import { escapeable } from "../actions/escapeable"
  import { fade, fly } from "svelte/transition"
  import { tick } from "svelte"

  let active = false
  let value = ""
  let replace = ""
  let input
  let replaceInput
  let itemMatches = []
  let selected = 0
  let message = ""

  $: searchItems(value, replace, $items)
  $: if (active) focusInput()
  $: if (value || replace) message = ""
  $: occurrences = itemMatches.reduce((p, c) => p + c.contentMatches?.length, 0)
  $: occurrencesString = `${ occurrences } occurrence${ occurrences > 1 ? "s" : "" } in ${ itemMatches.length } item${ itemMatches.length > 1 ? "s" : "" }`

  function searchItems() {
    if (!active) return
    if (!value) {
      itemMatches = []
      return
    }

    const filteredItems = $items.filter(i =>
      i.type == "item" &&
      i.content.indexOf(value) != -1)

    const regex = new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")

    itemMatches = filteredItems.map(i => {
      const contentMatches = []

      let match = null
      while ((match = regex.exec(i.content)) != null) {
        const index = match.index
        contentMatches.push({
          index,
          truncateStart: index > 10,
          truncateEnd: index + value.length < i.content.length,
          string: i.content.substring(
            Math.max(0, index - 10),
            Math.min(index + value.length + 20, i.content.length)
          )
        })
      }

      return {
        hidden: i.hidden,
        id: i.id,
        name: i.name,
        parent: i.parent,
        order: i.name.length - value.length,
        contentMatches
      }
    })

    selected = 0
  }

  function replaceInAll() {
    if (!active) return
    if (!itemMatches?.length) return

    itemMatches.forEach(match => {
      const item = getItemById(match.id)
      item.content = item.content.replaceAll(value, replace)
      updateItem(item)
    })

    message = `Replaced ${ occurrencesString }`

    searchItems()
  }

  function highlightString(string) {
    const index = string.indexOf(value)
    const subString = string.substring(index, index + value.length)
    let elementString = `<mark>${ subString }</mark>`

    if (replace) elementString += `<mark class="text-lightest"> ⇢ ${ replace }</mark>`

    return replaceBetween(string, elementString, index, index + value.length)
  }

  function getParentsString(id) {
    if (!id) return ""

    const itemNames = []

    while (id) {
      const parent = getItemById(id)
      itemNames.push(parent.name)

      id = parent.parent
    }

    return itemNames.reverse().join(" > ")
  }

  function selectItem(id) {
    setCurrentItemById(id)
  }

  function setSelected(add) {
    selected = selected + add
    if (selected > itemMatches.length - 1 || selected > itemMatches.length - 1) selected = 0
    else if (selected < 0) selected = itemMatches.length - 1
  }

  function keydown(event) {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyF") {
      event.preventDefault()
      active = !active
      if (active) {
        focusInput()

        const { from: fromIndex, to: toIndex } = $editorStates[$currentItem.id].selection.main
        const codeMirrorSelectedText = $editorStates[$currentItem.id].sliceDoc(fromIndex, toIndex)
        value = codeMirrorSelectedText || getSelection().toString()
      }
    }

    if (input != document.activeElement && replaceInput != document.activeElement) return
    if (!active) return

    if (selected && event.code === "Enter") {
      selectItem(itemMatches[selected].id)
    }

    if (event.code === "ArrowDown") {
      event.preventDefault()
      setSelected(1)
    }

    if (event.code === "ArrowUp") {
      event.preventDefault()
      setSelected(-1)
    }
  }

  async function focusInput() {
    await tick()
    input.focus()
  }
</script>

<svelte:window on:keydown={keydown} />

{#if !active}
  <button class="form-input bg-darker text-dark cursor-pointer text-left" on:click={() => active = true}>
    <em>Find/Replace in all... (Ctrl+Shift+F)</em>
  </button>
{/if}

{#if active}
  <div in:fly={{ duration: 150, y: -30 }} use:escapeable on:escape={() => active = false}>
    <input type="text" class="form-input bg-darker mt-1/4" placeholder="Find in all..." bind:value bind:this={input} />

    <div class="flex mt-1/16">
      <input type="text" class="form-input bg-darker" placeholder="Replace found with..." bind:value={replace} bind:this={replaceInput} />
      <button class="button button--secondary button--square button--small ml-1/16" on:click={replaceInAll}>Replace</button>
    </div>

    <div class="mt-1/16 text-italic text-dark text-small">Find is case sensitive</div>
  </div>

  {#if value}
    <div class="matches">
      {#if itemMatches?.length}
        <div class="text-italic text-dark mb-1/8">
          Found {occurrencesString}
        </div>
      {/if}

      {#if !itemMatches?.length && !message}
        <em class="text-dark">No matches found</em>
      {/if}

      {#each (itemMatches || []) as item, i}
        <button class="matches__item" class:matches__item--active={selected == i} on:click={() => selectItem(item.id)}>
          <div class="{item.hidden ? "matches__hidden" : ""}">{item.name}</div>

          {#if item.parent}
            <div class="text-small text-dark">{getParentsString(item.parent)}</div>
          {/if}

          <div class="text-dark text-small">
            <span class="text-lightest">Matches: {item.contentMatches?.length}</span>

            {#each (item.contentMatches || []) as match}
              <div>
                - {match.truncateStart ? "..." : ""}{@html highlightString(match.string)}{match.truncateEnd ? "..." : ""}
              </div>
            {/each}
          </div>
        </button>
      {/each}
    </div>
  {/if}

  {#if message}
    <div class="text-primary" in:fade={{ duration: 150 }}>{message}</div>
  {/if}
{/if}

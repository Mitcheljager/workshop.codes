<script>
  import { items } from "../../stores/editor"
  import { getItemById, replaceBetween, setCurrentItemById } from "../../utils/editor"
  import { fade, fly } from "svelte/transition"
  import { tick } from "svelte"

  let active = true
  let value = ""
  let input
  let itemMatches = []
  let selected = 0

  $: searchItems(value)
  $: if (active) focusInput()

  function searchItems() {
    if (!value) {
      itemMatches = []
      return
    }

    const filteredItems = $items.filter(i =>
      i.type == "item" &&
      i.content.indexOf(value) != -1)

    const regex = new RegExp(value, 'g');

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
        id: i.id,
        name: i.name,
        parent: i.parent,
        order: i.name.length - value.length,
        contentMatches,
      }
    })

    selected = 0
  }

  function highlightString(string) {
    const index = string.indexOf(value)
    const subString = string.substring(index, index + value.length)
    return replaceBetween(string, `<mark>${ subString }</mark>`, index, index + value.length)
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
    if (input != document.activeElement) return

    if (event.ctrlKey && event.shiftKey && event.keyCode == 70) { // F key
      event.preventDefault()
      active = !active
      if (active) focusInput()
    }

    if (!active) return

    if (selected && event.keyCode == 13) { // Enter key
      selectItem(itemMatches[selected].id)
    }

    if (event.keyCode == 40) { // Down array
      event.preventDefault()
      setSelected(1)
    }

    if (event.keyCode == 38) { // Up array
      event.preventDefault()
      setSelected(-1)
    }
  }

  async function focusInput() {
    await tick()
    input.focus()
  }
</script>

<svelte:window on:keydown={keydown} on:keydown={event => { if (event.key === "Escape") active = false }} />

{#if !active}
  <button class="form-input bg-darker text-dark cursor-pointer text-left" on:click={() => active = true}>
    <em>Find/Replace in all... (Ctrl+Shift+F)</em>
  </button>
{/if}

{#if active}
  <div class="flex mt-1/4">
    <input type="text" class="form-input bg-darker" placeholder="Find in all files..." bind:value bind:this={input} />
    <button class="button button--secondary button--square button--small ml-1/16">Find</button>
  </div>

  <em class="block mt-1/16 text-dark text-small">Note: Replace can not be undone</em>

  {#if value}
    <div class="matches">
      {#each itemMatches as item, i}
        <div class="matches__item" class:matches__item--active={selected == i} on:click={() => selectItem(item.id)}>
          {item.name}

          {#if item.parent}
            <small class="text-dark">{getParentsString(item.parent)}</small>
          {/if}

          <div class="text-dark text-small">
            <span class="text-white">Matches: {item.contentMatches.length}</span>

            {#each item.contentMatches as match}
              <div>
                - {match.truncateStart ? "..." : ""}{@html highlightString(match.string)}{match.truncateEnd ? "..." : ""}
              </div>
            {/each}
          </div>
        </div>
      {/each}

      {#if !itemMatches.length}
        <em class="text-dark pl-1/4">No matches found</em>
      {/if}
    </div>
  {/if}
{/if}

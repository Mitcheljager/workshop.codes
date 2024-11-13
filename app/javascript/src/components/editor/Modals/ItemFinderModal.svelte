<script>
  import Modal from "@components/editor/Modals/Modal.svelte"
  import { items, modal } from "@src/stores/editor"
  import { getItemById, setCurrentItemById } from "@src/utils/editor"
  import { replaceBetween } from "@utils/parse"
  import { onMount, tick } from "svelte"

  let value = ""
  let input
  let matches = []
  let selected = 0

  const maxItems = 10

  $: searchItems(value)
  $: sortedMatches = matches.sort((a, b) => a < b ? 1 : -1).slice(0, maxItems)

  onMount(focusInput)

  function searchItems() {
    const filteredItems = $items.filter(i =>
      i.type == "item" &&
      i.name.toLowerCase().indexOf(value.toLowerCase()) != -1)

    matches = filteredItems.map(i => ({
      id: i.id,
      name: i.name,
      parent: i.parent,
      order: i.name.length - value.length,
      from: i.name.toLowerCase().indexOf(value.toLocaleLowerCase())
    }))

    selected = 0
  }

  function highlightString(string, from) {
    const subString = string.substring(from, from + value.length)
    return replaceBetween(string,  `<mark>${subString}</mark>`, from, from + value.length)
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
    modal.close()
    value = ""
  }

  function setSelected(add) {
    selected = selected + add
    if (selected > matches.length - 1 || selected > maxItems - 1) selected = 0
    else if (selected < 0) selected = Math.min(matches.length, maxItems) - 1
  }

  function keydown(event) {
    if (!matches?.length) return

    if (event.code === "Enter") selectItem(matches[selected].id)
    if (event.code === "ArrowDown") setSelected(1)
    if (event.code === "ArrowUp") setSelected(-1)
    if (event.code === "Tab") setFocused()
  }

  async function setFocused() {
    await new Promise(res => setTimeout(res, 1))
    const i = document.activeElement?.dataset.i

    if (i) selected = i
  }

  async function focusInput() {
    await tick()
    input.focus()
  }
</script>

<svelte:window on:keydown={keydown} />

<Modal transparent flush maxWidth="600px">
  <input type="text" class="form-input form-input--large bg-darker" placeholder="Find files by name..." bind:value bind:this={input} />

  {#if value}
    <div class="matches matches--dropdown">
      {#each sortedMatches as match, i}
        <button class="matches__item" class:matches__item--active={selected == i} on:click={() => selectItem(match.id)} data-i={i}>
          {@html highlightString(match.name, match.from)}

          {#if match.parent}
            <small class="text-dark">{getParentsString(match.parent)}</small>
          {/if}
        </button>
      {/each}

      {#if !matches.length}
        <em class="text-dark pl-1/4">No matches found</em>
      {/if}
    </div>
  {/if}
</Modal>

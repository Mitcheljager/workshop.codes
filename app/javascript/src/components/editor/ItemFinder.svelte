<script>
  import { items } from "../../stores/editor"
  import { getItemById, replaceBetween, setCurrentItemById } from "../../utils/editor"
  import { fade, fly } from "svelte/transition"
  import { tick } from "svelte"

  let active = false
  let value = ""
  let input
  let matches = []
  let selected = 0

  const maxItems = 10

  $: searchItems(value)
  $: sortedMatches = matches.sort((a, b) => a < b ? 1 : -1).slice(0, maxItems)

  function searchItems() {
    const filteredItems = $items.filter(i =>
      i.type == "item" &&
      i.name.toLowerCase().indexOf(value.toLowerCase()) != -1)

    matches = filteredItems.map(i => ({
      id: i.id,
      name: i.name,
      parent: i.parent,
      order: i.name.length - value.length,
      from: i.name.toLowerCase().indexOf(value.toLocaleLowerCase()),
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
    active = false
    value = ""
  }

  function setSelected(add) {
    selected = selected + add
    if (selected > matches.length - 1 || selected > maxItems - 1) selected = 0
    else if (selected < 0) selected = Math.min(matches.length, maxItems) - 1
  }

  async function keydown(event) {
    if (event.ctrlKey && event.keyCode == 81) {
      event.preventDefault()
      active = !active
      await tick()
      input.focus()
    }

    if (!active) return

    if (event.keyCode == 13) {
      selectItem(matches[selected].id)
    }

    if (event.keyCode == 40) setSelected(1)
    if (event.keyCode == 38) setSelected(-1)
  }
</script>

<svelte:window on:keydown={keydown} on:keydown={event => { if (event.key === "Escape") active = false }} />

{#if active}
  <div class="modal modal--top" transition:fade={{ duration: 100 }} data-ignore>
    <div class="modal__content p-0 bg-transparent" style="max-width: 600px" transition:fly={{ y: 100, duration: 200 }}>
      <input type="text" class="form-input form-input--large bg-darker" placeholder="Search files by name..." bind:value bind:this={input} />

      {#if value}
        <div class="matches">
          {#each sortedMatches as match, i}
            <div class="matches__item" class:matches__item--active={selected == i} on:click={() => selectItem(match.id)}>
              {@html highlightString(match.name, match.from)}

              {#if match.parent}
                <small class="text-dark">{getParentsString(match.parent)}</small>
              {/if}
            </div>
          {/each}

          {#if !matches.length}
            <em class="text-dark pl-1/4">No matches found</em>
          {/if}
        </div>
      {/if}
    </div>

    <div class="modal__backdrop" on:click={() => active = false} />
  </div>
{/if}

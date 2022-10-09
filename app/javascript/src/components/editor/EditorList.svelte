<script>
  import { Sortable, MultiDrag } from "sortablejs"
  import EditorItem from "./EditorItem.svelte"
  import EditorFolder from "./EditorFolder.svelte"
  import { items } from "../../stores/editor.js"
  import { onMount } from "svelte"

  export let parent = null

  let element
  let isHoldingCtrl

  $: itemsInParent = getItemsInParent($items)

  onMount(() => {
    try {
      Sortable.mount(new MultiDrag())
    } catch {}

		new Sortable(element, {
      group: "items",
			animation: 100,
      swapTreshhold: 0.25,
      multiDrag: true,
      multiDragKey: "ctrl",
      onSelect: event => {
        if (isHoldingCtrl) event.items.forEach(item => item.classList.add("sortable__multi-selected"))
      },
      onDeselect: event => {
        event.item.classList.remove("sortable__multi-selected")
      },
      store: {
        set: updateOrder
      }
		})
  })

  function updateOrder() {
    const elements = document.querySelectorAll("[data-item-id]")
    elements.forEach((e, i) => {
      const id = e.dataset.itemId
      if (!id) return

      const item = $items.filter(item => item.id === id)[0]
      if (!item) return
      item.position = i
    })
  }

  function getItemsInParent() {
    return $items.filter(i => parent ? i.parent == parent.id : !i.parent )
                 .sort((a, b) => a.position > b.position)
  }

  function keypress(event) {
    isHoldingCtrl = event.ctrlKey
  }
</script>

<svelte:window on:keydown={keypress} on:keyup={keypress} />

<div class="sortable" bind:this={element}>
  {#each itemsInParent || [] as item, index}
    {#if item.type === "item"}
      <EditorItem {item} {index} />
    {:else if item.type === "folder"}
      <EditorFolder {item} {index} />
    {/if}
  {/each}
</div>

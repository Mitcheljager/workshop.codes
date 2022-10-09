<script>
  import Sortable from "sortablejs"
  import EditorItem from "./EditorItem.svelte"
  import EditorFolder from "./EditorFolder.svelte"
  import { items } from "../../stores/editor.js"
  import { onMount } from "svelte"

  export let parent = null

  let element

  $: itemsInParent = getItemsInParent($items)

  onMount(() => {
		Sortable.create(element, {
      group: "items",
			animation: 100,
      swapTreshhold: 0.25,
      store: {
        set: updateOrder
      }
		})
  })

  function updateOrder() {
    const elements = document.querySelectorAll("[data-item-id]")
    console.log(elements)
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
</script>

<div class="sortable" bind:this={element}>
  {#each itemsInParent || [] as item, index}
    {#if item.type === "item"}
      <EditorItem {item} {index} />
    {:else if item.type === "folder"}
      <EditorFolder {item} {index} />
    {/if}
  {/each}
</div>

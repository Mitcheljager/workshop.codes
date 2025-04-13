<script>
  import { Sortable, MultiDrag } from "sortablejs"
  import EditorItem from "@components/editor/EditorItem.svelte"
  import EditorFolder from "@components/editor/EditorFolder.svelte"
  import { items, sortedItems } from "@stores/editor"
  import { onMount } from "svelte"
  import { flip } from "svelte/animate"

  export let parent = null

  // https://github.com/sveltejs/svelte/issues/11826
  // With Svelte 5 the state of the dom is tightly linked to their state. When sorting items with Sortable that dom state
  // isn't matched correctly. Instead of making the list in the dom reactive to `$items`, we write it to a const.
  // The order of the list is updated by Sortable only. The store is still updated under the hood.
  // However, this prevents the list from updating correctly when adding/removing items from the list. To fix this,
  // The upper most EditorList component (in EditorAside) is wrapped in a key equal to $items.length, re-rendering the
  // entire list when anything is added or removed. Is this good enough? Let's find out!
  const itemsInParent = getItemsInParent()

  let element
  let isHoldingCtrl

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
      fallbackTolerance: 3,
      delayOnTouchOnly: true,
      delay: 100,
      onRemove: updateOrder,
      onUpdate: updateOrder,
      onSelect: event => {
        if (isHoldingCtrl) event.items.forEach(item => item.classList.add("sortable__multi-selected"))
      },
      onDeselect: event => {
        event.item.classList.remove("sortable__multi-selected")
      }
    })
  })

  function updateOrder() {
    const elements = document.querySelectorAll("[data-item-id]")
    elements.forEach((element, i) => {
      const item = $items.find(item => item.id === element.dataset.itemId)

      if (!item) return

      item.position = i
      item.parent = element.parentNode.closest("[data-item-id]")?.dataset.itemId || null
    })

    $items = [...$items]
  }

  function getItemsInParent(_items) {
    return $sortedItems.filter(i => parent ? i.parent == parent.id : !i.parent )
  }

  function keypress(event) {
    isHoldingCtrl = event.ctrlKey
  }
</script>

<svelte:window on:keydown={keypress} on:keyup={keypress} />

<div class="sortable" bind:this={element}>
  {#each itemsInParent || [] as { id, type } (id)}
    <!--
      TODO: Fix me, this isn't great.
      This is written to a separate const so that the state of the item remains bound to the item in the list.
      This isn't the case by default because of the explanation on line 11 of this file.
    -->
    {@const item = $items.find(item => item.id === id)}

    <div animate:flip={{ duration: 200 }}>
      {#if type === "item"}
        <EditorItem {item} />
      {:else if type === "folder"}
        <EditorFolder {item} />
      {/if}
    </div>
  {/each}

  {#if $items.length && !getItemsInParent($items).length}
    <em class="pl-1/4 ml-1/8 text-dark">Empty folder</em>
  {/if}
</div>

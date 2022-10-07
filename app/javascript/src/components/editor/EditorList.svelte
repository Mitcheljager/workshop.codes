<script>
  import EditorItem from "./EditorItem.svelte"
  import EditorFolder from "./EditorFolder.svelte"
  import { items } from "../../stores/editor.js"

  export let parent = null

  let itemsInParent = $items.filter(i => parent ? i.parent == parent.id : !i.parent )
</script>

{#each itemsInParent || [] as item, index}
  {#if item.type === "item"}
    <EditorItem {item} {index} />
  {:else if item.type === "folder"}
    <EditorFolder {item} {index} />
  {/if}
{/each}

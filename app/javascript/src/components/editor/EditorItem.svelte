<script>
  import EditorItemDestroy from "./EditorItemDestroy.svelte"
  import EditorItemName from "./EditorItemName.svelte"
  import { currentItem } from "../../stores/editor.js"

  export let item
</script>

<button
  class="editor-item"
  class:editor-item--active={$currentItem.id == item.id}
  data-item-id={item.id}
  on:click|stopPropagation={() => $currentItem = item}>

  <span>
    <EditorItemName {item} />
  </span>

  <div class="editor-item__actions">
    <EditorItemDestroy {item} />
  </div>
</button>

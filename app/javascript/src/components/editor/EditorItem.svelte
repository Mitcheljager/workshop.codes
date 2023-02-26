<script>
  import EditorItemDestroy from "./EditorItemDestroy.svelte"
  import EditorItemName from "./EditorItemName.svelte"
  import EditorItemHide from "./EditorItemHide.svelte"
  import { currentItem } from "../../stores/editor.js"
  import { isAnyParentHidden } from "../../utils/editor"

  export let item
</script>

<button
  class="editor-item"
  class:editor-item--active={$currentItem.id == item.id}
  class:editor-item--hidden={item.hidden || isAnyParentHidden(item)}
  data-item-id={item.id}
  on:click|stopPropagation={() => $currentItem = item}>

  <span>
    <EditorItemName {item} />
  </span>

  <div class="editor-item__actions" on:click|stopPropagation>
    <EditorItemHide {item} />
    <EditorItemDestroy {item} />
  </div>
</button>

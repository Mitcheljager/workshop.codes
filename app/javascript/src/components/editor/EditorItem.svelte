<script>
  import EditorItemDestroy from "@components/editor/EditorItemDestroy.svelte"
  import EditorItemName from "@components/editor/EditorItemName.svelte"
  import EditorItemHide from "@components/editor/EditorItemHide.svelte"
  import EditorItemDuplicate from "@components/editor/EditorItemDuplicate.svelte"
  import { currentItem } from "@src/stores/editor.js"
  import { isAnyParentHidden } from "@src/utils/editor"

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

  <button class="editor-item__actions" on:click|stopPropagation>
    <EditorItemDuplicate {item} />
    <EditorItemHide {item} />
    <EditorItemDestroy {item} />
  </button>
</button>

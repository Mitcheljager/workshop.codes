<script>
  import EditorItemDestroy from "@components/editor/EditorItemDestroy.svelte"
  import EditorItemName from "@components/editor/EditorItemName.svelte"
  import EditorItemHide from "@components/editor/EditorItemHide.svelte"
  import EditorItemDuplicate from "@components/editor/EditorItemDuplicate.svelte"
  import { currentItem } from "@stores/editor"
  import { isAnyParentHidden } from "@utils/editor"

  export let item
</script>

<button
  class="editor-item"
  class:editor-item--active={$currentItem && $currentItem.id == item.id}
  class:editor-item--hidden={item.hidden || isAnyParentHidden(item)}
  data-item-id={item.id}
  on:click|stopPropagation={() => $currentItem = item}>

  <span>
    <EditorItemName {item} />
  </span>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="editor-item__actions" on:click|stopPropagation>
    <EditorItemDuplicate {item} />
    <EditorItemHide {item} />
    <EditorItemDestroy {item} />
  </div>
</button>

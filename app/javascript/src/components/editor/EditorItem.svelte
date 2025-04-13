<script>
  import EditorItemDestroy from "@components/editor/EditorItemDestroy.svelte"
  import EditorItemName from "@components/editor/EditorItemName.svelte"
  import EditorItemHide from "@components/editor/EditorItemHide.svelte"
  import EditorItemDuplicate from "@components/editor/EditorItemDuplicate.svelte"
  import { currentItem } from "@stores/editor"
  import { isAnyParentHidden } from "@utils/editor"

  export let item
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
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
</div>

<script>
  import { onMount } from "svelte"
  import { openFolders } from "../../stores/editor"
  import { isAnyParentHidden, toggleFolderState } from "../../utils/editor"
  import EditorItemDestroy from "./EditorItemDestroy.svelte"
  import EditorItemHide from "./EditorItemHide.svelte"
  import EditorItemDuplicate from "./EditorItemDuplicate.svelte"
  import EditorItemName from "./EditorItemName.svelte"
  import EditorList from "./EditorList.svelte"

  export let item = {}

  $: expanded = $openFolders.includes(item.id)

  onMount(setInitialState)

  function setInitialState() {
    const state = localStorage.getItem(`folder_expanded_${ item.id }`) == "true" ? true : false

    if (state) toggleFolderState(item, state, false)
  }

</script>

<div
  class="editor-item editor-folder"
  class:editor-folder--expanded={expanded}
  class:editor-item--hidden={item.hidden || isAnyParentHidden(item)}
  data-item-id={item.id}>
  <button class="editor-folder__icon" on:click|stopPropagation={() => toggleFolderState(item, !expanded)}>
    &gt;
  </button>

  <span>
    <EditorItemName {item} />
  </span>

  <div class="editor-folder__content" class:editor-folder__content--expanded={expanded}>
    <EditorList parent={item} />
  </div>

  <div class="editor-item__actions">
    <EditorItemDuplicate {item} />
    <EditorItemHide {item} />
    <EditorItemDestroy {item} />
  </div>
</div>

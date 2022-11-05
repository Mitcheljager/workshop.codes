<script>
  import { onMount } from "svelte"
  import { openFolders } from "../../stores/editor"
  import { toggleFolderState } from "../../utils/editor"
  import EditorItemDestroy from "./EditorItemDestroy.svelte"
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
  data-item-id={item.id}>
  <button class="editor-folder__icon empty-button" on:click|stopPropagation={() => toggleFolderState(item, !expanded)}>
    &gt;
  </button>

  <span>
    <EditorItemName {item} />
  </span>

  <div class="editor-folder__content" class:editor-folder__content--expanded={expanded}>
    <EditorList parent={item} />
  </div>

  <div class="editor-item__actions">
    <EditorItemDestroy {item} />
  </div>
</div>

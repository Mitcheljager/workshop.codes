<script>
  import EditorItemDestroy from "./EditorItemDestroy.svelte"
  import EditorItemName from "./EditorItemName.svelte"
  import EditorList from "./EditorList.svelte"

  export let item = {}

  let expanded = localStorage.getItem(`folder_expanded_${item.id}`) == "true" ? true : false

  function toggleExpanded() {
    expanded = !expanded
    localStorage.setItem(`folder_expanded_${item.id}`, expanded)
  }
</script>

<div
  class="editor-item editor-folder"
  class:editor-folder--expanded={expanded}
  data-item-id={item.id}>
  <button class="editor-folder__icon empty-button" on:click|stopPropagation={toggleExpanded}>
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

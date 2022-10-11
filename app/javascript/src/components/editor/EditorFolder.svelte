<script>
  import EditorItemDestroy from "./EditorItemDestroy.svelte"
  import EditorList from "./EditorList.svelte"

  export let item = {}

  let expanded = true
</script>

<button
  class="editor-item editor-folder"
  class:editor-folder--expanded={expanded}
  data-item-id={item.id}
  on:click|stopPropagation={() => expanded = !expanded}>
  <div class="editor-folder__icon">
    &gt;
  </div>

  <span>
    {item.name}
  </span>

  <div class="editor-folder__content" class:editor-folder__content--expanded={expanded}>
    <EditorList parent={item} />
  </div>

  <div class="editor-item__actions">
    <EditorItemDestroy {item} />
  </div>
</button>

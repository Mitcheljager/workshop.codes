<script>
  import EditorList from "./EditorList.svelte"
  import { slide } from "svelte/transition"

  export let item = {}
  export let index

  let expanded = true
</script>

<div
  class="editor-item editor-folder"
  class:editor-folder--expanded={expanded}
  on:click|stopPropagation={() => expanded = !expanded}>
  <div class="editor-folder__icon">
    &gt;
  </div>

  <span>
    {item.name}
  </span>

  <div class="editor-folder__content">
    {#if expanded}
      <div transition:slide={{ duration: 150 }}>
        <EditorList parent={item} />
      </div>
    {/if}
  </div>
</div>

<script>
  import EditorItemCreate from "./EditorItemCreate.svelte"
  import EditorList from "./EditorList.svelte"

  let element

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 49) {
      element.focus()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<div bind:this={element} tabindex="0">
  <EditorList />

  <div class="p-1/4">
    <EditorItemCreate>
      <span class="button button--secondary w-100">+</span>
    </EditorItemCreate>
  </div>
</div>

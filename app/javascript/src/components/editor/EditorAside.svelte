<script>
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
</div>

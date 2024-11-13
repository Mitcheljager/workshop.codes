<script>
  import { Modal } from "@constants/Modal"
  import { modal } from "@src/stores/editor"

  function keydown(event) {
    if (!(event.ctrlKey && event.code === "KeyQ")) return

    event.preventDefault()
    modal.show(Modal.ItemFinder)
  }
</script>

<svelte:window on:keydown={keydown} />

<button
  class="form-input bg-darker text-dark cursor-pointer text-left"
  on:click={() => modal.show(Modal.ItemFinder)}>

  <em>Find by name... (Ctrl+Q)</em>
</button>

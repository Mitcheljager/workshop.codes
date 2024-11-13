<script>
  import { Modal } from "@constants/Modal"
  import { modal } from "@src/stores/editor"

  function keydown(event) {
    if (!(event.ctrlKey && event.code === "KeyB")) return

    event.preventDefault()
    modal.show(Modal.LineFinder)
  }
</script>

<svelte:window on:keydown={keydown} />

<button
  class="mt-1/16 form-input bg-darker text-dark cursor-pointer text-left"
  on:click={() => modal.show(Modal.LineFinder)}>

  <em>Find line... (Ctrl+B)</em>
</button>

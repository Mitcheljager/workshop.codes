<script>
  import { modal } from "../../../stores/editor"
  import { escapeable } from "../../actions/escapeable"
  import { fade } from "svelte/transition"

  export let align = "top"
  export let flush = false
  export let transparent = false
  export let maxWidth = null

  function close() {
    modal.close()
  }
</script>

<div
  class="modal modal--{align}"
  transition:fade={{ duration: 100 }}
  use:escapeable on:escape={() => modal.close()}
  data-ignore>

  <div class="modal__content" class:bg-transparent={transparent} class:p-0={flush} style:max-width={maxWidth}>
    <slot {close} />
  </div>

  <div class="modal__backdrop" on:click={close} />
</div>

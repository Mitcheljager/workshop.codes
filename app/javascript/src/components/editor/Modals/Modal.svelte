<script>
  import { modal } from "@stores/editor"
  import { escapeable } from "@components/actions/escapeable"
  import { fade, scale } from "svelte/transition"

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
  transition:fade={{ duration: 150 }}
  use:escapeable on:escape={() => modal.close()}
  data-ignore>

  <div
    class="modal__content modal__content--no-shadow overflow-hidden"
    class:bg-transparent={transparent}
    class:p-0={flush}
    style:max-width={maxWidth}
    transition:scale={{ duration: 150, start: 0.75 }}>
    <slot {close} />
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal__backdrop" on:click={close} />
</div>

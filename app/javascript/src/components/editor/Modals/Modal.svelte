<script lang="ts">
  import { modal } from "@stores/editor"
  import { escapeable } from "@src/components/actions/escapeable"
  import { fade, scale } from "svelte/transition"

  export let align: "top" = "top"
  export let flush = false
  export let transparent = false
  export let maxWidth: string | number | null = null
  export let internalScrolling = false

  function close() {
    modal.close()
  }
</script>

<div
  class="modal modal--{align}"
  transition:fade={{ duration: 150 }}
  use:escapeable={{ onescape: () => modal.close() }}
  role="dialog"
  data-ignore>

  <div
    class="modal__content modal__content--no-shadow"
    class:modal__content--internal-scrolling={internalScrolling}
    class:bg-transparent={transparent}
    class:p-0={flush}
    style:max-width={maxWidth}
    transition:scale={{ duration: 150, start: 0.75 }}>
    <slot {close} />
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="modal__backdrop" on:click={close}></div>
</div>

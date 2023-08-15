<script>
  import { modal } from "../../../stores/editor"
  import { escapeable } from "../../actions/escapeable"
  import { fade } from "svelte/transition"

  export let align = "top"
  export let flush = false
  export let key = "key"

  function close() {
    modal.close()
  }
</script>

{#if $modal?.key === key}
  <div
    class="modal modal--{align}"
    transition:fade={{ duration: 100 }}
    use:escapeable on:escape={close}
    data-ignore>

    <div class="modal__content" class:p-0={flush}>
      <slot {close} />
    </div>

    <div class="modal__backdrop" on:click={close} />
  </div>
{/if}

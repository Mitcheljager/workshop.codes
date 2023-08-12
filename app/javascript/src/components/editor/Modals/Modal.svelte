<script>
  import { currentProject, isSignedIn, modal } from "../../../stores/editor"
  import { createProject, renameCurrentProject } from "../../../utils/project"
  import { escapeable } from "../../actions/escapeable"
  import { createEventDispatcher } from "svelte"
  import { fade } from "svelte/transition"

  export let align = "top"
  export let flush = false
  export let key = "key"

  const dispatch = createEventDispatcher()

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

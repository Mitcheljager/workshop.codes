<script>
  import BackupsModal from "../Modals/BackupsModal.svelte"
  import CreateProjectModal from "../Modals/CreateProjectModal.svelte"
  import { modal } from "../../../stores/editor"
  import { Modal } from "../../../constants/Modal"

  const components = {
    [Modal.Backups]: BackupsModal,
    [Modal.CreateProject]: CreateProjectModal
  }

  $: component = components[$modal?.key]
</script>

{#if component}
  <svelte:component this={component} />
{/if}

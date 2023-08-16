<script>
  import BackupsModal from "./BackupsModal.svelte"
  import CreateProjectModal from "./CreateProjectModal.svelte"
  import LineFinderModal from "./LineFinderModal.svelte"
  import ItemFinderModal from "./ItemFinderModal.svelte"
  import { modal } from "../../../stores/editor"
  import { Modal } from "../../../constants/Modal"

  const components = {
    [Modal.Backups]: BackupsModal,
    [Modal.CreateProject]: CreateProjectModal,
    [Modal.LineFinder]: LineFinderModal,
    [Modal.ItemFinder]: ItemFinderModal
  }

  $: component = components[$modal?.key]
</script>

{#if component}
  <svelte:component this={component} />
{/if}

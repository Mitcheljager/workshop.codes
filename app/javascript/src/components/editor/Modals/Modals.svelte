<script>
  import BackupsModal from "@components/editor/Modals/BackupsModal.svelte"
  import CreateProjectModal from "@components/editor/Modals/CreateProjectModal.svelte"
  import LineFinderModal from "@components/editor/Modals/LineFinderModal.svelte"
  import ItemFinderModal from "@components/editor/Modals/ItemFinderModal.svelte"
  import TranslationKeysModal from "@components/editor/Modals/TranslationKeysModal.svelte"
  import ScriptImporterModal from "@components/editor/Modals/ScriptImporterModal.svelte"
  import { modal } from "@stores/editor"
  import { Modal } from "@constants/Modal"

  const components = {
    [Modal.Backups]: BackupsModal,
    [Modal.CreateProject]: CreateProjectModal,
    [Modal.LineFinder]: LineFinderModal,
    [Modal.ItemFinder]: ItemFinderModal,
    [Modal.TranslationKeys]: TranslationKeysModal,
    [Modal.ScriptImporter]: ScriptImporterModal
  }

  $: component = components[$modal?.key]
</script>

{#if component}
  <svelte:component this={component} />
{/if}

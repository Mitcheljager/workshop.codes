<script>
  import { duplicateItem } from "@utils/editor"
  import Copy from "@src/components/icon/Copy.svelte"

  export let item

  function duplicate() {
    duplicateItem(item)
  }
</script>

<button on:click={duplicate} data-tooltip="Duplicate" aria-label="Duplicate">
  <Copy width="24" />
</button>

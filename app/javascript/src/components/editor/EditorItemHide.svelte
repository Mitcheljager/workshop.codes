<script>
  import EyeIcon from "@components/icon/Eye.svelte"
  import { toggleHideItem } from "@utils/editor"

  export let item

  $: hidden = item?.hidden

  function hide() {
    toggleHideItem(item.id)
  }
</script>

<button class:inactive={hidden} on:click={hide} data-tooltip="Exclude from compiler">
  <EyeIcon crossed={hidden} />
</button>

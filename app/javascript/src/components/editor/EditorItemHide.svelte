<script>
  import EyeIcon from "../icon/Eye.svelte"
  import { toggleHideItem } from "../../utils/editor"

  export let item

  function hide() {
    toggleHideItem(item.id)
  }
</script>

<button class:inactive={item.hidden} on:click={hide} data-tooltip="Exclude from compiler">
  <EyeIcon crossed={item.hidden} />
</button>

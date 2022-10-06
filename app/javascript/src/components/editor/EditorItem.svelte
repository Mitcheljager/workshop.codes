<script>
  import { currentItemIndex } from "../../stores/editor.js"

  export let item
  export let index
</script>

<div
  class="editor-item"
  class:editor-item--active={$currentItemIndex == index}
  on:click={() => $currentItemIndex = index}>
  { item?.name }
</div>

<script>
  import { currentItem } from "../../stores/editor.js"

  export let item
</script>

<button
  class="editor-item"
  class:editor-item--active={$currentItem.id == item.id}
  data-item-id={item.id}
  on:click|stopPropagation={() => $currentItem = item}>
  <span>{ item?.name }</span>
</button>

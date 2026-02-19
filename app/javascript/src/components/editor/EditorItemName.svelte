<script>
  import { updateItemName } from "@utils/editor"

  export let item

  function update({ target }) {
    updateItemName(item.id, target.value)
  }
</script>

<input type="text" class="inline-input" value={item.name} on:input={update} on:blur={update} />

<script>
  import { updateItemName } from "@utils/editor"

  export let item

  let value = item.name
</script>

<input type="text" class="inline-input" bind:value on:input={() => updateItemName(item.id, value)} />

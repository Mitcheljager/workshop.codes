<script>
  import { createEventDispatcher } from "svelte"

  export let key
  export let item
  export let label

  const dispatch = createEventDispatcher()

  let group = Object.values(item.values).find(v => v.default)["en-US"]

  function change() {
    dispatch("change", group)
  }
</script>

<label class="form-label mt-1/4 mb-1/8" for="">{label}</label>

{#each item.values as value}
  <div class="checkbox ml-1/4">
    <input type="radio" name={key} value={value["en-US"]} checked={value.default} bind:group id={key + value["en-US"]} on:change={change} />
    <label for={key + value["en-US"]}>{value["en-US"]}</label>
  </div>
{/each}

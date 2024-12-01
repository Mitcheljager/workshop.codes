<script>
  import { createEventDispatcher } from "svelte"

  export let key
  export let item
  export let label

  const dispatch = createEventDispatcher()

  let group = item.default

  function change() {
    dispatch("change", group)
  }
</script>

<label class="form-label mb-1/8" for="">{label}</label>

{#each item.values as value}
  <div class="checkbox ml-1/4">
    <input type="radio" name={key} {value} checked={item.default === value} bind:group id={key + value} on:change={change} />
    <label for={key + value}>{value}</label>
  </div>
{/each}

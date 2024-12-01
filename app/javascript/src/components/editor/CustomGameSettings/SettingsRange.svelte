<script>
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let item
  export let label

  let value = item.default

  function change() {
    dispatch("change", parseInt(value))
  }
</script>

<div class="form-group mt-0">
  <label class="form-label" for="">{label}</label>
  <input class="range" type="range" min={item.min} max={item.max} step="5" bind:value on:change={change} />
  <input class="inline-input" style="max-width: 3rem" type="number" bind:value on:change={change} />
</div>

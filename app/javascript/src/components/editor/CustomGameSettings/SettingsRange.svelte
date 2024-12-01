<script>
  import { createEventDispatcher } from "svelte"

  export let item
  export let label

  const dispatch = createEventDispatcher()

  const { min, max, multiplier, precise } = item
  const step = precise ? 0.1 : max > 50 ? 5 : 1

  let value = item.default

  function change() {
    const parsed = precise ? parseFloat(value) : parseInt(value) * (multiplier || 1)
    dispatch("change", parsed)
  }
</script>

<div class="form-group mt-0">
  <label class="form-label mb-0" for="">{label}</label>
  <input class="range" type="range" {min} {max} {step} bind:value on:change={change} />
  <input class="inline-input" style="max-width: 3rem" type="number" bind:value on:change={change} />
</div>

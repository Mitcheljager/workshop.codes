<script>
  export let item
  export let label

  let value = item.default
</script>

<div class="form-group mt-0">
  <label class="form-label" for="">{label}</label>
  <input class="range" type="range" min={item.min} max={item.max} step="5" bind:value />
  <input class="inline-input" style="max-width: 3rem" type="number" bind:value />
</div>

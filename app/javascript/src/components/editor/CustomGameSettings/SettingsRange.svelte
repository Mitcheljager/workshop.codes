<script>
  export let item
  export let label

  let value = item.values.default
</script>

<div class="form-group mt-0">
  <label for="">{label}</label>
  <input class="range" type="range" min={item.values.min} max={item.values.max} bind:value />
</div>

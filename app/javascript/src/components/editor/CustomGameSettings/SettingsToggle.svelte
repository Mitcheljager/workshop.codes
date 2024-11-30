<script>
  export let key
  export let item
  export let label

  const id = key + item

  let checked = item.default
</script>

<div class="switch-checkbox">
  <input class="switch-checkbox__input" type="checkbox" {id} bind:checked />
  <label class="switch-checkbox__label" for={id}>{label}</label>
</div>

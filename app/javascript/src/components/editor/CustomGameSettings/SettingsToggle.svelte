<script>
  import { createEventDispatcher } from "svelte"

  export let key
  export let item
  export let label

  const dispatch = createEventDispatcher()
  const id = key + item

  let checked = item.default

  function change() {
    dispatch("change", checked)
  }
</script>

<div class="switch-checkbox">
  <input class="switch-checkbox__input" type="checkbox" {id} bind:checked on:change={change} />
  <label class="switch-checkbox__label form-label" for={id}>{label}</label>
</div>

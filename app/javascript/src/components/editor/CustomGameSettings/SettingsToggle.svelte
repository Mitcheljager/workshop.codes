<script>
  import { createEventDispatcher } from "svelte"

  export let key
  export let item
  export let label

  const dispatch = createEventDispatcher()
  const id = key + item
  const isNonBoolean = typeof item.enabled === "string"
  const initial = item.current || item.default

  let checked = (isNonBoolean && initial === item.enabled) || (!isNonBoolean && initial)

  function change() {
    const enabled = item.enabled || true
    const disabled = item.disabled || false
    const value = checked ? enabled : disabled

    dispatch("change", value)
  }
</script>

<div class="switch-checkbox">
  <input class="switch-checkbox__input" type="checkbox" {id} bind:checked on:change={change} />
  <label class="switch-checkbox__label form-label" for={id}>{label}</label>
</div>

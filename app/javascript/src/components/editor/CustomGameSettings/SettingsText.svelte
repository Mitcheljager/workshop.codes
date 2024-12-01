<script>
  import { createEventDispatcher } from "svelte"

  export let item
  export let label

  const dispatch = createEventDispatcher()

  let value = item.values.default || item.default

  function change() {
    dispatch("change", value)
  }
</script>

<div class="form-group" style="max-width: 20rem">
  <label class="form-label" for="">{label}</label>

  {#if item.large}
    <textarea class="form-input form-textarea form-textarea--extra-small" bind:value on:change={change} />
  {:else}
    <input class="form-input" type="text" bind:value on:change={change} />
  {/if}
</div>

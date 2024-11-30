<script>
  export let item
  export let label

  let value = item.values.default || item.default
</script>

<div class="form-group" style="max-width: 20rem">
  <label class="form-label" for="">{label}</label>

  {#if item.large}
    <textarea class="form-input form-textarea form-textarea--extra-small" bind:value />
  {:else}
    <input class="form-input" type="text" bind:value />
  {/if}
</div>

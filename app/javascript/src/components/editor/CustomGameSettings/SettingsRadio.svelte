<script>
  export let key
  export let item
  export let label
</script>

<label class="form-label mt-1/4 mb-1/8" for="">{label}</label>

{#each item.values as value}
  <div class="checkbox ml-1/4">
    <input type="radio" name={key} value={value["en-US"]} checked={value.default} id={key + value["en-US"]} />
    <label for={key + value["en-US"]}>{value["en-US"]}</label>
  </div>
{/each}

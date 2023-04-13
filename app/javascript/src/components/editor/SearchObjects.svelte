<script>
  export let objects = []
  export let key = "title"
  export let placeholder = "Search..."
  export let filteredObjects = objects

  let query = ""

  $: if (objects) search(query)

  function search() {
    if (query) filteredObjects = objects.filter(o => o[key].toLowerCase().indexOf(query.toLowerCase()) !== -1)
    else filteredObjects = objects

  }
</script>

<input type="text" class="form-input bg-darker" {placeholder} bind:value={query} />

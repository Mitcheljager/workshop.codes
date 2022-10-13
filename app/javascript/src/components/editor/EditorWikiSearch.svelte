<script>
  import FetchRails from "../../fetch-rails"
  import debounce from "../../debounce"
  import { createEventDispatcher } from "svelte"

  let query = ""
  let results = []
  let loading = false
  let input

  const dispatch = createEventDispatcher()
  const baseUrl = "wiki/search/"

  $: if (query) {
    loading = true
    fetchResults()
  }

  $: if (!query) results = []

  const fetchResults = debounce(() => {
    results = []
    loading = true

    const url = baseUrl + query + ".json?parse_markdown=true"

    new FetchRails(url).get()
      .then(data => {
        if (!data) throw Error("No results")

        results = JSON.parse(data)
      })
      .catch(error => {
        results = []
        console.error(error)
      })
      .finally(() => loading = false)
  }, 250)

  function selectResult(result) {
    query = ""
    dispatch("select", { result })
  }

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 51) {
      event.preventDefault()
      input.focus()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<div class="editor-wiki-search">
  <input
    bind:this={input}
    bind:value={query}
    type="text"
    class="form-input bg-darker"
    placeholder="Search the wiki... (Ctrl+3)" />

  {#if loading || results.length}
    <div class="editor-wiki-results">
      {#each results as result}
        <button class="editor-wiki-results__item" on:click={() => selectResult(result)}>
          {result.title}
          <small>{result.category.title}</small>
        </button>
      {/each}

      {#if loading}
        <div class="spinner spinner--small mt-1/4" />
      {/if}
    </div>
  {/if}
</div>

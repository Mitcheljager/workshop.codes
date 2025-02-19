<script>
  import { onMount } from "svelte"
  import FetchRails from "@src/fetch-rails"
  import Tags from "@components/form/Tags.svelte"

  let showDerivative = false
  export let maxCodes = 5
  export let currentSources = []

  onMount(() => {
    if (currentSources.length) showDerivative = true
  })

  async function handleAutoCompleteRequest(value) {
    if (!value) return []

    return new FetchRails(`/search?code=${value}`).get({
      returnResponse: true,
      parameters: {
        headers: { "Accept": "application/json" }
      }
    }).then(async response => {
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)

      const json = await response.json()
      return json.map(post => postToResult(post))
    })
  }

  function postToResult(post) {
    return {
      label: post.code,
      html: `<strong>${post.code.toUpperCase()}</strong> - "${post.title}" by ${post.user.username}`
    }
  }
</script>

<div class="form-group mt-1/4">
  <div class="switch-checkbox">
    <input
      id="show_derivative"
      class="switch-checkbox__input"
      autocomplete="off"
      type="checkbox"
      aria-label="Toggle derivatives"
      bind:checked={showDerivative}/>

    <label
      class="switch-checkbox__label"
      for="show_derivative">
      This code is a fork/uses other codes
    </label>
  </div>

  {#if showDerivative}
    <div class="form-group mt-1/4">
      <div class="form-hint mt-1/4 mb-1/4 text-left" id="derivative-codes">
        Enter the import code(s) which your mode uses. You can enter up to {maxCodes} codes.

        <br />
        <strong>Separate import codes with a comma (<code>,</code>).</strong>
      </div>

      <Tags
        prefix="post"
        name="derivations"
        placeholder="CODE1, CODE2, etc."
        ariaLabel="Derivative codes (Comma separated)"
        ariaControls="derivative-codes"
        fillValues={currentSources}
        hidden={!showDerivative}
        allowSpace={false}
        onlyAlphanumeric={true}
        onlyCaps={true}
        tagLimit={maxCodes}
        useAutoComplete={true}
        fetchAutoCompleteValues={handleAutoCompleteRequest} />
    </div>
  {/if}
</div>

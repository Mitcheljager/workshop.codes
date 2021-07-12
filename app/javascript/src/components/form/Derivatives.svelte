<script>
  import Tags from './Tags.svelte';
  import { onMount } from 'svelte';

  let showDerivative = false;
  let maxCodes = 5;
  export let currentSources = [];

  onMount(() => {
    if (currentSources.length) showDerivative = true;
  });

  async function handleAutoCompleteRequest(value) {
    if (!value) return [];

    const timeout = 8000;
    const timeoutController = new AbortController();
    const timeoutID = setTimeout(() => timeoutController.abort(), timeout);

    const response = await fetch(`/code/${value}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      signal: timeoutController.signal
    });
    const text = await response.text();
    clearTimeout(timeoutID);

    if (response.ok) {
      const json = JSON.parse(text);
      return json.map(post => postToResult(post));
    } else {
      throw new Error(`${response.status} ${response.statusText}`);
    }
  }

  function postToResult(post) {
    return {
      label: post.code,
      html: `<strong>${post.code.toUpperCase()}</strong> - ${post.title} by ${post.user.username}`
    };
  }
</script>

<div class="form-group mt-1/4">
  <div class="switch-checkbox">
    <input
      id="show_derivative"
      class="switch-checkbox__input"
      autocomplete="off"
      type="checkbox"
      bind:checked={showDerivative}
    >
    <label
      class="switch-checkbox__label"
      for="show_derivative"
    >
      This code is a fork/uses other codes
    </label>
  </div>

  {#if showDerivative}
    <div class="form-group mt-1/4">
      <div class="form-hint text-left">
        Enter the import code(s) which your mode uses. You can enter up to {maxCodes} codes.
        <br />
        <strong>Separate import codes with a comma (<code>,</code>).</strong>
      </div>

      <Tags
        name="derivatives"
        placeholder="CODE1,CODE2,etc."
        fillValues={currentSources}
        hidden={!showDerivative}
        allowSpace={false}
        onlyAlphanumeric={true}
        onlyCaps={true}
        tagLimit={maxCodes}
        useAutoComplete={true}
        fetchAutoCompleteValues={handleAutoCompleteRequest}
      />
    </div>
  {/if}
</div>

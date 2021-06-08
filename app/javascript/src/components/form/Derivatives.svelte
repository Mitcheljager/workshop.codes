<script>
  import Tags from './Tags.svelte';

  let showDerivative = false;

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
      html: `<strong>${post.code}</strong> - ${post.title} by ${post.user.username}`
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

  <div class="form-group mt-1/4" hidden={!showDerivative}>
    <div class="form-hint--left">
      Enter the import code(s) which your mode uses. You can enter up to X codes. <strong>Separate import codes with a comma ",".</strong>
    </div>

    <Tags
      placeholder="CODE1,CODE2,etc."
      hidden={!showDerivative}
      allowSpace={false}
      onlyAlphanumeric={true}
      onlyCaps={true}
      tagLimit=5
      useAutoComplete={true}
      fetchAutoCompleteValues={handleAutoCompleteRequest}
    />
  </div>
</div>
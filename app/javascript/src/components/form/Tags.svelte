<!-- Adapted from https://github.com/agustinl/svelte-tags-input -->
<script>
  let values = [];
  let input = "";
  let inputElem;
  let resultsList;

  export let valueToString = (v) => v;
  export let placeholder = "Insert tags here";
  export let delimiter = ",";
  export let hidden = false;
  export let allowRepeats = false;
  export let onlyAlphanumeric = false;
  export let allowSpace = true;
  export let onlyCaps = false;
  export let tagLimit = 0;
  export let useAutoComplete = false;
  export let fetchAutoCompleteValues = (value) => {
    return new Promise(resolve => {
      resolve([]);
    });
  };
  export let minCharsAutoComplete = 2;
  let storePlaceholder = placeholder;
  let autoCompletePromise = fetchAutoCompleteValues(input);

  let timer = null;
  let waiting = false;
  $: if (useAutoComplete && input.length >= minCharsAutoComplete) {
    clearTimeout(timer);
    waiting = true;
    timer = setTimeout(() => {
      autoCompletePromise = fetchAutoCompleteValues(input);
      waiting = false;
    }, 500);
  }
  $: console.log(resultsList);

  function keydown(event) {
    if (event.key == "Backspace" || event.key == "Delete") {
      if (input == "") removeTag(values.length - 1);
    }

    if (useAutoComplete && !waiting && resultsList && resultsList.querySelectorAll("li.tag-item").length) inputHandleAutoComplete(event);
  }

  function inputHandleAutoComplete(event) {
    // TAB: If autocompleting, and a value can be found, add the first value
    if (event.key == "Tab") {
        event.preventDefault();
        resultsList.querySelectorAll("li.tag-item")[0].click();
    }
    // ArrowDown: focus first element of results
    if (event.key == "ArrowDown" || event.key == "Down") {
      event.preventDefault();
      resultsList.querySelector("li:first-child").focus();
    }
    // ArrowUp: focus last element of results
    if (event.key == "ArrowUp" || event.key == "Up") {
      event.preventDefault();
      resultsList.querySelector("li:last-child").focus();
    }
  }

  function cleanInput(value) {
    return splitTags(value)
      .map((tag) => cleanTag(tag))
      .join(delimiter);
  }

  function parseInput() {
    input = cleanInput(input);
    if (!input.includes(delimiter)) return;
    splitTags(input).forEach((tag) => addTag(tag));
  }

  function addTag(value) {
    value = cleanTag(value);
    input = "";

    if (value == "") return;
    if (!allowRepeats && values.includes(value)) return;

    values = [...values, value.trim()];

    if (tagLimit && values.length == tagLimit) {
      inputElem.readOnly = true;
      placeholder = "";
    }

    inputElem.focus();
  }

  function removeTag(index) {
    values = [...values.slice(0, index), ...values.slice(index + 1)];
    placeholder = storePlaceholder;
    inputElem.focus();
    inputElem.readOnly = false;
  }

  function splitTags(data) {
    return data.split(delimiter);
  }

  function cleanTag(tag) {
    tag = tag.trim();
    if (!allowSpace) tag = tag.replace(/ +/g, "");
    if (onlyAlphanumeric) tag = tag.replace(/[^a-zA-Z0-9 ]+/g, "");
    if (onlyCaps) tag = tag.toUpperCase();
    return tag;
  }

  function navAutoComplete(event, index, label, length) {
    if (!useAutoComplete) return;

    event.preventDefault();

    if (event.key == "ArrowDown" || event.key == "Down") {
      if (index + 1 >= length) {
        resultsList.querySelector("li:first-child").focus();
        return;
      }
      resultsList.querySelectorAll("li.tag-item")[index + 1].focus();
      return;
    }

    if (event.key == "ArrowUp" || event.key == "Up") {
      if (index <= 0) {
        resultsList.querySelector("li:last-child").focus();
        return;
      }
      resultsList.querySelectorAll("li.tag-item")[index - 1].focus();
      return;
    }

    if (event.key == "Enter") {
      addTag(label);
      return;
    }

    if (event.key == "Escape" || event.key == "Esc") {
      inputElem.focus();
    }
  }
</script>

<div class="form-tags-wrapper form-input mt-1/4">
  {#each values as value, i}
    <span class="form-tags-tag">
      {valueToString(value)}
      <button
        class="form-tags-tag-remove"
        on:click|preventDefault={() => removeTag(i)}
      >
        &#215;
      </button>
    </span>
  {/each}
  <input
    type="text"
    bind:this={inputElem}
    bind:value={input}
    on:input={parseInput}
    on:keydown={keydown}
    {placeholder}
    class="form-tags-input"
  />
  <input
    id="post_derivatives"
    name="post[derivatives]"
    value={hidden ? null : values}
    type="hidden"
  />
</div>

{#if useAutoComplete && !waiting && input.length >= minCharsAutoComplete}
  <div class="form-tags-autocomplete-results-anchor">
    <ul bind:this={resultsList} class="form-tags-autocomplete-results">
      {#await autoCompletePromise}
        <li><strong>Searching...</strong></li>
      {:then autoCompleteValues}
        {#if autoCompleteValues.length}
          {#each autoCompleteValues.slice(0, 5) as result, index}
            <li
              class="tag-item"
              tabindex="-1"
              on:keydown={(event) => navAutoComplete(event, index, result.label, autoCompleteValues.length)}
              on:click={() => addTag(result.label)}
            >
              {@html result.html}
            </li>
          {/each}
        {:else}
          <li><p>No results on Workshop.codes</p></li>
        {/if}
      {:catch error}
        <li>
          <strong class="text-red">
            Something went wrong. Try again later.
          </strong>
          <br />
          <p><small>{error}</small></p>
        </li>
      {/await}
    </ul>
  </div>
{/if}

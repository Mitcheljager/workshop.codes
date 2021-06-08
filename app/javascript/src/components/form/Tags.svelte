<!-- Adapted from https://github.com/agustinl/svelte-tags-input -->
<script>
    let values = [];
    let input = "";
    let inputElem;
    let outputElem;

    export let valueToString = ((v) => v);
    export let placeholder = 'Insert tags here';
    export let delimiter = ',';
    export let hidden = false;
    export let allowRepeats = false;
    export let onlyAlphanumeric = false;
    export let allowSpace = true;
    export let tagLimit = 0;
    export let useAutoComplete = false;
    export let fetchAutoCompleteValues = (value) => {
        return [];
    };
    let storePlaceholder = placeholder;
    let autoCompletePromise = fetchAutoCompleteValues(input);

    let timer = null;
    $: if (useAutoComplete && input.length > 0) {
        clearTimeout(timer);
        timer = setTimeout(
            () => autoCompletePromise = fetchAutoCompleteValues(input),
            750
        );
    }

    function keydown(event) {
        if (event.key == "Backspace" || event.key == "Delete") {
            if (input == "") removeTag(values.length - 1);
        }
    }

    function cleanInput(value) {
        return splitTags(value).map(tag => cleanTag(tag)).join(delimiter);
    }

    function parseInput(event) {
        input = cleanInput(input);
        if (!input.includes(delimiter)) return;
        splitTags(input).forEach(tag => addTag(tag));
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
    }

    function removeTag(index) {
        values = [...values.slice(0, index), ...values.slice(index+1)];
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
        return tag;
    }
</script>

<div class="form-tags-wrapper form-input mt-1/4">
    {#each values as value, i}
        <span class="form-tags-tag">
            {valueToString(value)}
            <button class="form-tags-tag-remove" on:click|preventDefault={() => removeTag(i)}> &#215;</button>
        </span>
    {/each}
    <input
        type="text"
        bind:this={inputElem}
        bind:value={input}
        on:input={parseInput}
        on:keydown={keydown}
        placeholder={placeholder}
        class="form-tags-input"
    >
    <input
        bind:this={outputElem}
        id="post_derivatives"
        value={hidden ? null : values}
        type="hidden">
</div>

{#if useAutoComplete && input.length > 0}
    <div class="form-tags-autocomplete-results-anchor">
        <ul class="form-tags-autocomplete-results">
            {#await autoCompletePromise}
                <strong>Searching...</strong>
            {:then autoCompleteValues}
                {#if autoCompleteValues.length > 0}
                    {#each autoCompleteValues.slice(0, 5) as result, index}
                        <li
                            tabindex="-1"
                            on:keydown={navAutoComplete(index, result.label)}
                            on:click={() => addTag(result.label)}>
                                {@html result.html}
                        </li>
                    {/each}
                {:else}
                    <p>No results</p>
                {/if}
            {:catch error}
                <strong class="text-red">Something went wrong. Try again later.</strong>
                <br>
                <p><small>{error}</small></p>
            {/await}
        </ul>
    </div>
{/if}

<!-- Adapted from https://github.com/agustinl/svelte-tags-input -->
<script>

    import { onMount } from "svelte";

    let values = [];
    let input = "";

    export let valueToString = ((v) => v);
    export let placeholder = 'Insert tags here';
    export let delimiter = ',';
    export let hidden = false;
    export let allowRepeats = false;
    export let onlyAlphanumeric = false;
    export let allowSpace = true;
    export let tagLimit = 0;

    let storePlaceholder = placeholder;
    let inputElem;
    let outputElem;

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

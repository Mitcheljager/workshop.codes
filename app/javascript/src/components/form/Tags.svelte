<!-- Adapted from https://github.com/agustinl/svelte-tags-input -->
<script>

    import { onMount } from "svelte";

    let values = [];
    let input = "";

    export let valueToString = ((v) => v);
    export let placeholder = 'Insert tags here';
    export let delimiter = ',';
    export let hidden = false;
    export let allowDupes = false;
    export let onlyAlphanumeric = false;
    export let allowSpace = true;

    let outputElem;

    function keydown(event) {
        if (event.key == delimiter) return; // Allow parseInput to handle it
        if (!allowSpace && (event.key == " " || event.key == "Spacebar")) {
            event.preventDefault();
        }
        if (onlyAlphanumeric && !(/^[a-zA-Z0-9]$/.test(event.key))) {
            event.preventDefault();
        }
    }

    function parseInput(event) {
        const currValues = event.target.value;
        if (!currValues.includes(delimiter)) return;
        splitTags(currValues).forEach(tag => addTag(tag));
    }

    function addTag(value) {
        value = cleanTag(value);
        input = "";

        if (value == "") return;
        if (!allowDupes && values.includes(value)) return;

        values = [...values, value.trim()];
    }

    function removeTag(index) {
        values = [...values.slice(0, index), ...values.slice(index+1)];
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
    {#each values as value, i (value)}
        <span class="form-tags-tag">
            {valueToString(value)}
            <button class="form-tags-tag-remove" on:click|preventDefault={removeTag(i)}> &#215;</button>
        </span>
    {/each}
    <input
        type="text"
        bind:value={input}
        on:input={parseInput}
        on:keydown={keydown}
        placeholder={placeholder}
        class=""
    >
    <input
        bind:this={outputElem}
        id="post_derivatives"
        value={hidden ? null : values}
        type="hidden">
</div>
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

    let outputElem;

    function parseInput(event) {
        const currValues = event.target.value;
        if (!currValues.includes(delimiter)) return;
        splitTags(currValues).forEach(tag => addTag(tag));
    }

    function addTag(value) {
        value = value.trim();
        input = "";

        if (value == "") return;
        if (!allowDupes && values.includes(value)) return;

        values = [...values, value.trim()];
    }

    function removeTag(index) {
        values = [...values.slice(0, index), ...values.slice(index+1)];
    }

    function splitTags(data) {
        return data.split(delimiter).map(tag => tag.trim());
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
        placeholder={placeholder}
        class=""
    >
    <input
        bind:this={outputElem}
        id="post_derivatives"
        value={hidden ? null : values}
        type="hidden">
</div>
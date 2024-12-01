<script>
  import SettingsHeroes from "./SettingsHeroes.svelte"
  import SettingsOptions from "./SettingsOptions.svelte"
  import SettingsRange from "./SettingsRange.svelte"
  import SettingsText from "./SettingsText.svelte"
  import SettingsToggle from "./SettingsToggle.svelte"
  import { createEventDispatcher } from "svelte"

  const dispatch = createEventDispatcher()

  export let tree = {}

  const components = {
    boolean: SettingsToggle,
    range: SettingsRange,
    string: SettingsText,
    heroes: SettingsHeroes
  }

  function change(key, value) {
    const isDefault = value === tree[key].default
    const isDefaultInOptions = Array.isArray(tree[key].values) && tree[key].current === value

    if (isDefault || isDefaultInOptions) delete tree[key].current
    else tree[key].current = value

    dispatch("change")
  }
</script>

{#each Object.entries(tree) as [key, item]}
  {@const label = item["en-US"] || key}

  <!--
    Each item is of a certain predefined type:
    - If it's an object it is always a deeper tree and will be iterated over again.
    - If It's an array it's a list of single select options.
    - If It's a string is given type that matches one of the input components defined in the `components` object.
  -->

  <div class="mt-1/8 pl-1/4" data-searchable-attributes="{key.toLowerCase()} {item["en-US"]?.toLowerCase() || ""}">
    {#if typeof item === "object" && item.values}
      {#if typeof item.values === "object" && !Array.isArray(item.values)}
        <h3 class="mt-1/2 mb-1/4" data-key={key}>{label}</h3>
        <svelte:self tree={item.values} on:change />
      {:else if Array.isArray(item.values)}
        <SettingsOptions {item} {key} {label} on:change={({ detail }) => change(key, detail)} />
      {:else if typeof item.values === "string" && components[item.values]}
        <svelte:component this={components[item.values]} {item} {key} {label} on:change={({ detail }) => change(key, detail)} />
      {:else }
        No valid type was given for "{key}"
      {/if}
    {/if}
  </div>
{/each}

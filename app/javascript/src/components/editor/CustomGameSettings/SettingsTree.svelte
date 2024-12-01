<script>
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
    string: SettingsText
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

  <div class="mt-1/8 pl-1/4" data-searchable-attributes="{key.toLowerCase()} {item["en-US"]?.toLowerCase() || ""}">
    {#if typeof item === "object" && item.values}
      {#if typeof item.values === "object" && !Array.isArray(item.values)}
        <h3 class="mt-1/2 mb-1/4">{label}</h3>
        <svelte:self tree={item.values} on:change />
      {:else if Array.isArray(item.values)}
        <SettingsOptions {item} {key} {label} on:change={({ detail }) => change(key, detail)} />
      {:else if typeof item.values === "string"}
        <svelte:component this={components[item.values]} {item} {key} {label} on:change={({ detail }) => change(key, detail)} />
      {/if}
    {/if}
  </div>
{/each}

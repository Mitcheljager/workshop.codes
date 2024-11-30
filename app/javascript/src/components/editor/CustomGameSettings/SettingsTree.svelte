<script>
  import SettingsRadio from "./SettingsRadio.svelte"
  import SettingsRange from "./SettingsRange.svelte"
  import SettingsText from "./SettingsText.svelte"
  import SettingsToggle from "./SettingsToggle.svelte"

  export let tree = {}

  const components = {
    boolean: SettingsToggle,
    range: SettingsRange,
    string: SettingsText
  }
</script>

{#each Object.entries(tree) as [key, item]}
  {@const label = item["en-US"] || key}

  <div class="mt-1/8 pl-1/4" data-searchable-attributes="{key.toLowerCase()} {item["en-US"]?.toLowerCase() || ""}">
    {#if typeof item === "object" && item.values}
      {#if typeof item.values === "object" && !Array.isArray(item.values)}
        <h3 class="mt-1/2 mb-1/4">{label}</h3>
        <svelte:self tree={item.values} />
      {:else if Array.isArray(item.values)}
        <SettingsRadio {item} {key} {label} />
      {:else if typeof item.values === "string"}
        <svelte:component this={components[item.values]} {item} {key} {label} />
      {/if}
    {/if}
  </div>
{/each}

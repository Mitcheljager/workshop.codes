<script>
  import { customGameSettings } from "@src/stores/editor"

  export let tree = $customGameSettings
</script>

{#each Object.entries(tree) as [key, value]}
  <div class="mt-1/8">
    {value["en-US"] || key}:

    {#if typeof value === "object"}
      {#if value.values && typeof value.values === "object" && !Array.isArray(value.values)}
        <svelte:self tree={value.values} />
      {:else if value.values && Array.isArray(value.values)}
        {#each value.values as value}
          <div>
            {value["en-US"]}
            <input type="radio" name={key} value={value["en-US"]} />
          </div>
        {/each}
      {:else if value.values && typeof value.values === "string"}
        {value.default}

        {#if value.values === "boolean"}
          <input type="checkbox" checked={value.default} />
        {/if}

        {#if value.values === "range"}
          <input type="range" min={value.values.min} max={value.values.max} value={value.values.default} />
        {/if}
      {/if}
    {/if}
  </div>
{/each}
---

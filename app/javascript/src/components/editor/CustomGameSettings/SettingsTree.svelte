<script>
  export let tree = {}
</script>

{#each Object.entries(tree) as [key, item]}
  <div class="mt-1/8" data-searchable-attributes="{key.toLowerCase()} {item["en-US"]?.toLowerCase() || ""}">
    {item["en-US"] || key}:

    {#if typeof item === "object"}
      {#if item.values && typeof item.values === "object" && !Array.isArray(item.values)}
        <svelte:self tree={item.values} />
      {:else if item.values && Array.isArray(item.values)}
        {#each item.values as value}
          <div class="pl-1/4">
            <label for={key + value["en-US"]}>{value["en-US"]}</label>
            <input type="radio" name={key} value={key + value["en-US"]} id={key + value["en-US"]} />
          </div>
        {/each}
      {:else if item.values && typeof item.values === "string"}
        {item.default}

        {#if item.values === "boolean"}
          <input type="checkbox" checked={item.default} />
        {/if}

        {#if item.values === "range"}
          <input type="range" min={item.values.min} max={item.values.max} value={item.values.default} />
        {/if}

        {#if item.values === "string"}
          <input type="text" value={item.values.default || item.default} />
        {/if}
      {/if}
    {/if}
  </div>
{/each}
---

<script>
  import { createEventDispatcher } from "svelte"

  export let tree = {}
  export let lastScrolledPastKey = null
  export let depth = 0

  const dispatch = createEventDispatcher()
</script>

{#each Object.entries(tree) as [key, item]}
  <div class="{depth > 1 ? "pl-1/8" : ""}" data-searchable-attributes="{key.toLowerCase()} {item["en-US"]?.toLowerCase() || ""}">
    {#if typeof item.values === "object" && !Array.isArray(item.values)}
      {#if depth}
        <button class:text-primary={lastScrolledPastKey === key} data-key={key} on:click>{key}</button>
      {/if}

      <svelte:self tree={item.values} {lastScrolledPastKey} depth={depth + 1} on:click />
    {/if}
  </div>
{/each}

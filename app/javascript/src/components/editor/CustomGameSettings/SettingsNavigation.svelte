<script>
  import { createEventDispatcher } from "svelte"

  export let tree = {}

  const dispatch = createEventDispatcher()
</script>

{#each Object.entries(tree) as [key, item]}
  <div class="pl-1/8" data-searchable-attributes="{key.toLowerCase()} {item["en-US"]?.toLowerCase() || ""}">
    {#if typeof item.values === "object" && !Array.isArray(item.values)}
      <button data-key={key} on:click>{key}</button>
      <svelte:self tree={item.values} on:click />
    {/if}
  </div>
{/each}

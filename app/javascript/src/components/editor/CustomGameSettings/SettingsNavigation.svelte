<script>
  import { createEventDispatcher } from "svelte"

  export let tree = {}
  export let parentKey = ""
  export let lastScrolledPastKey = null
  export let depth = 0

  const dispatch = createEventDispatcher()
</script>

{#each Object.entries(tree) as [key, item]}
  <div data-searchable-attributes="{key.toLowerCase()} {item["en-US"]?.toLowerCase() || ""}">
    {#if typeof item.values === "object" && !Array.isArray(item.values)}
      {#if depth}
        <button
          class="custom-game-settings__sidebar-item"
          class:custom-game-settings__sidebar-item--is-active={lastScrolledPastKey === parentKey + key}
          class:custom-game-settings__sidebar-item--top-level={depth < 2}
          data-scroll-spy={parentKey + key} on:click>
          {key}
        </button>
      {/if}

      <svelte:self tree={item.values} parentKey={key} {lastScrolledPastKey} depth={depth + 1} on:click />
    {/if}
  </div>
{/each}

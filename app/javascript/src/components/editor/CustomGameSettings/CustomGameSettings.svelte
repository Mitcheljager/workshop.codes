<script>
  import { customGameSettings } from "@src/stores/editor"
  import SettingsTree from "./SettingsTree.svelte"

  let query = ""

  $: search(query)

  // Search through elements in tree, deliberately not very Svelte-y to not have to worry about state.
  function search(query) {
    query = query.toLowerCase()

    const elements = document.querySelectorAll("[data-searchable-attributes]")

    elements.forEach(element => {
      const attributes = element.dataset.searchableAttributes
      const containsQuery = attributes.includes(query)
      const selector = `[data-searchable-attributes*="${query}"]`
      const containsChildWithQuery = element.querySelector(selector)
      const isInParentWithQuery = element.closest(selector)

      element.classList.toggle("hidden", query && !containsQuery && !containsChildWithQuery && !isInParentWithQuery)
    })
  }
</script>

<div class="p-1/4 bg-darker">
  <input class="form-input mb-1/1" type="text" placeholder="Search" bind:value={query} />

  <div data-searchable-attributes="main">
    <h2 class="mt-0 mb-1/8"><strong>Code</strong></h2>
    <SettingsTree tree={$customGameSettings.main.values} />
  </div>

  <div data-searchable-attributes="gamemodes">
    <h2 class="mt-1/1 mb-1/8"><strong>Gamemodes</strong></h2>
    <SettingsTree tree={$customGameSettings.gamemodes.values} />
  </div>

  <div data-searchable-attributes="lobby">
    <h2 class="mt-1/1 mb-1/8"><strong>Lobby</strong></h2>
    <SettingsTree tree={$customGameSettings.lobby.values} />
  </div>

  <div data-searchable-attributes="heroes">
    <h2 class="mt-1/1 mb-1/8"><strong>Heroes</strong></h2>
    <SettingsTree tree={$customGameSettings.heroes.values} />
  </div>
</div>

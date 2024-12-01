<script>
  import { customGameSettings } from "@src/stores/editor"
  import { setContext } from "svelte"
  import { writable } from "svelte/store"
  import SettingsTree from "./SettingsTree.svelte"
  import SettingsNavigation from "./SettingsNavigation.svelte"

  const settings = { ...$customGameSettings }
  const scrollOffset = 20

  let contentElement
  let lastScrolledPastKey = null
  let query = ""

  $: search(query)

  const navigation = { settings: { values: { Main: settings.main, Lobby: settings.lobby, Gamemodes: settings.gamemodes, Heroes: settings.heroes } } }

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

  function scrollToItem({ target }) {
    const key = target.dataset.key
    const targetElement = contentElement.querySelector(`[data-key="${key}"]`)
    const top = targetElement.offsetTop - scrollOffset

    contentElement.scrollTo({ top })
  }

  function scrollSpy() {
    const elements = contentElement.querySelectorAll("[data-key]")

    lastScrolledPastKey = null

    elements.forEach(element => {
      const bottomDistance = element.getBoundingClientRect().bottom
      const elementHeight = element.clientHeight
      const topOffset = contentElement.getBoundingClientRect().top

      if (bottomDistance - elementHeight > topOffset + scrollOffset + 1) return

      lastScrolledPastKey = element.dataset.key
    })
  }
</script>

<div class="custom-game-settings">
  <div class="custom-game-settings__sidebar">
    <input class="form-input mb-1/4" type="text" placeholder="Search" bind:value={query} />

    <SettingsNavigation tree={navigation} {lastScrolledPastKey} on:click={scrollToItem} />
  </div>

  <div class="custom-game-settings__content" bind:this={contentElement} on:scroll={scrollSpy}>
    <div data-searchable-attributes="main">
      <h2 class="mt-0 mb-1/8" data-key="Main"><strong>Main</strong></h2>
      <SettingsTree on:change={() => console.log(settings)} tree={settings.main.values}  />
    </div>

    <div data-searchable-attributes="lobby">
      <h2 class="mt-1/1 mb-1/8" data-key="Lobby"><strong>Lobby</strong></h2>
      <SettingsTree on:change={() => console.log(settings)} tree={settings.lobby.values} />
    </div>

    <div data-searchable-attributes="gamemodes">
      <h2 class="mt-1/1 mb-1/8" data-key="Gamemodes"><strong>Gamemodes</strong></h2>
      <SettingsTree on:change={() => console.log(settings)} tree={settings.gamemodes.values} />
    </div>

    <div data-searchable-attributes="heroes">
      <h2 class="mt-1/1 mb-1/8" data-key="Heroes"><strong>Heroes</strong></h2>
      <SettingsTree on:change={() => console.log(settings)} tree={settings.heroes.values} />
    </div>
  </div>
</div>

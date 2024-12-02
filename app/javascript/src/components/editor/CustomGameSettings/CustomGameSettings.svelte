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

  const navigation = { "": { values: { Main: settings.main, Lobby: settings.lobby, Gamemodes: settings.gamemodes, Heroes: settings.heroes } } }

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
    const key = target.dataset.scrollSpy
    const targetElement = contentElement.querySelector(`[data-scroll-spy="${key}"]`)
    const top = targetElement.offsetTop - scrollOffset

    contentElement.scrollTo({ top })
  }

  function scrollSpy() {
    const elements = contentElement.querySelectorAll("[data-scroll-spy]")

    lastScrolledPastKey = null

    elements.forEach(element => {
      const bottomDistance = element.getBoundingClientRect().bottom
      const elementHeight = element.clientHeight
      const topOffset = contentElement.getBoundingClientRect().top

      if (bottomDistance - elementHeight > topOffset + scrollOffset + 1) return

      lastScrolledPastKey = element.dataset.scrollSpy
    })
  }
</script>

<div class="custom-game-settings">
  <div class="custom-game-settings__sidebar">
    <input class="form-input mb-1/4" type="text" placeholder="Search" bind:value={query} />

    <SettingsNavigation tree={navigation} {lastScrolledPastKey} on:click={scrollToItem} />
  </div>

  <div class="custom-game-settings__content" bind:this={contentElement} on:scroll={scrollSpy}>
    {#each ["Main", "Lobby", "Gamemodes", "Heroes"] as item}
      <div data-searchable-attributes={item}>
        <h2 class="mt-1/1 mb-1/8" data-scroll-spy={item}><strong>{item}</strong></h2>
        <SettingsTree on:change={() => console.log(settings)} tree={settings[item.toLowerCase()].values} parentKey={item} />
      </div>
    {/each}
  </div>
</div>

<script>
  import { fly } from "svelte/transition"
  import { templates } from "../../lib/templates"
  import { createNewItem } from "../../utils/editor"
  import { items, currentItem } from "../../stores/editor"
  import Plus from "../icon/Plus.svelte"

  let active = false
  let element
  let dropup = false

  function outsideClick(event) {
    if (!active) return
    if (event.target != element) active = false
  }

  function createTemplate(template, name) {
    createItem(name, templates[template])
  }

  function createItem(name, content, type = "item") {
    const newItem = createNewItem(name, content, $items.length, type)
    $items = [...$items, newItem]
    if (type == "item") $currentItem = newItem
  }

  function toggle() {
    active = !active

    dropup = window.innerHeight - element.getBoundingClientRect().bottom < 100
  }
</script>

<svelte:window on:click={outsideClick} on:keydown={event => { if (event.key === "Escape") active = false }} />

<div class="dropdown" class:dropup>
  <button class="button button--secondary button--icon-square" on:click|stopPropagation={toggle} bind:this={element}>
    <Plus />
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content block">
      <button on:click={() => createTemplate("RuleGlobal", "Global Rule")} class="dropdown__item empty-button">Rule - Global</button>
      <button on:click={() => createTemplate("RuleEachPlayer", "Each Player Rule")} class="dropdown__item empty-button">Rule - Each Player</button>
      <button on:click={() => createTemplate("Subroutine", "Subroutine")} class="dropdown__item empty-button">Subroutine</button>
      <button on:click={() => createTemplate("Settings", "Settings")} class="dropdown__item empty-button">Settings</button>
      <button on:click={() => createTemplate("Mixin", "Mixin")} class="dropdown__item empty-button">Mixin</button>
      <button on:click={() => createTemplate("Empty", "New item")} class="dropdown__item empty-button">Empty</button>
      <hr>
      <button on:click={() => createItem("New folder", "", "folder")} class="dropdown__item empty-button">Folder</button>
    </div>
  {/if}
</div>

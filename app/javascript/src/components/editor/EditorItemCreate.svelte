<script>
  import { fly } from "svelte/transition"
  import { templates } from "../../lib/templates"
  import { createNewItem } from "../../utils/editor"
  import { items, currentItem } from "../../stores/editor"
  import { escapeable } from "../actions/escapeable"

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

<svelte:window on:click={outsideClick} />

<div class="dropdown w-100" class:dropup>
  <button class="w-100" on:click|stopPropagation={toggle} bind:this={element}>
    <slot />
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} use:escapeable on:escape={() => active = false} class="dropdown__content dropdown__content--left block w-100">
      <button on:click={() => createTemplate("RuleGlobal", "Global Rule")} class="dropdown__item">Rule - Global</button>
      <button on:click={() => createTemplate("RuleEachPlayer", "Each Player Rule")} class="dropdown__item">Rule - Each Player</button>
      <button on:click={() => createTemplate("Subroutine", "Subroutine")} class="dropdown__item">Subroutine</button>
      <button on:click={() => createTemplate("Settings", "Settings")} class="dropdown__item">Settings</button>
      <button on:click={() => createTemplate("Mixin", "Mixin")} class="dropdown__item">Mixin</button>
      <button on:click={() => createTemplate("Empty", "New item")} class="dropdown__item">Empty</button>
      <hr>
      <button on:click={() => createItem("New folder", "", "folder")} class="dropdown__item">Folder</button>
    </div>
  {/if}
</div>

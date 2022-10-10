<script>
  import { fly } from "svelte/transition"
  import { templates } from "../../lib/templates"
  import { createNewItem } from "../../utils/editor"
  import { items } from "../../stores/editor"

  let active = false
  let element

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
  }
</script>

<svelte:window on:click={outsideClick} on:keydown={event => { if (event.key === "Escape") active = false }} />

<div class="dropdown w-100">
  <button class="empty-button" on:click|stopPropagation={() => active = !active} bind:this={element}>
    <slot />
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--left block w-100">
      <button on:click={() => createTemplate("RuleGlobal", "Global Rule")} class="dropdown__item empty-button">Rule - Global</button>
      <button on:click={() => createTemplate("RuleEachPlayer", "Each Player Rule")} class="dropdown__item empty-button">Rule - Each Player</button>
      <button on:click={() => createTemplate("Subroutine", "Subroutine")} class="dropdown__item empty-button">Subroutine</button>
      <button on:click={() => createTemplate("Settings", "Settings")} class="dropdown__item empty-button">Settings</button>
      <button on:click={() => createTemplate("Empty", "New item")} class="dropdown__item empty-button">Empty</button>
      <hr>
      <button on:click={() => createItem("New folder", "", "folder")} class="dropdown__item empty-button">Folder</button>
    </div>
  {/if}
</div>

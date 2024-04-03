<script>
  import { fly } from "svelte/transition"
  import { templates } from "../../lib/templates"
  import { createNewItem } from "../../utils/editor"
  import { items, currentItem } from "../../stores/editor"
  import { escapeable } from "../actions/escapeable"
  import { outsideClick } from "../actions/outsideClick"

  let active = false
  let element
  let dropup = false

  function createTemplate(template, name) {
    createItem(name, templates[template])
  }

  function createItem(name, content, type = "item") {
    const newItem = createNewItem(name, content, $items.length, type)
    $items = [...$items, newItem]
    if (type == "item") $currentItem = newItem
  }

  function withCloseDropdown(fn) {
    return (... args) => {
      fn(... args)
      active = false
    }
  }

  function toggle() {
    active = !active

    dropup = window.innerHeight - element.getBoundingClientRect().bottom < 100
  }
</script>

<div class="dropdown w-100" class:dropup use:outsideClick on:outsideClick={() => active = false}>
  <button class="w-100" on:click|stopPropagation={toggle} bind:this={element}>
    <slot />
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} use:escapeable on:escape={() => active = false} class="dropdown__content dropdown__content--left block w-100">
      <button on:click={withCloseDropdown(() => createTemplate("RuleGlobal", "Global Rule"))} class="dropdown__item">Rule - Global</button>
      <button on:click={withCloseDropdown(() => createTemplate("RuleEachPlayer", "Each Player Rule"))} class="dropdown__item">Rule - Each Player</button>
      <button on:click={withCloseDropdown(() => createTemplate("Subroutine", "Subroutine"))} class="dropdown__item">Subroutine</button>
      <button on:click={withCloseDropdown(() => createTemplate("Settings", "Settings"))} class="dropdown__item">Settings</button>
      <button on:click={withCloseDropdown(() => createTemplate("Mixin", "Mixin"))} class="dropdown__item">Mixin</button>
      <button on:click={withCloseDropdown(() => createTemplate("Empty", "New item"))} class="dropdown__item">Empty</button>
      <hr/>
      <button on:click={withCloseDropdown(() => createItem("New folder", "", "folder"))} class="dropdown__item">Folder</button>
    </div>
  {/if}
</div>

<script>
  import { items } from "../../stores/editor"
  import { createNewItem } from "../../utils/editor"
  import { getSettings } from "../../utils/parse"
  import { escapeable } from "../actions/escapeable"
  import { fade } from "svelte/transition"

  let active = false
  let replaceScript = false
  let value = ""

  function findSettings() {
    const [start, end] = getSettings(value)

    if (!(start || end)) return

    return createNewItem("Settings", value.slice(start, end), $items.length)
  }

  function findAllRules() {
    const rules = value.split(/(?=(disabled rule|(?<!disabled\s+)rule)\()/g)
    const newItems = []

    let counter = 0
    rules.forEach(rule => {
      const name = getTypeName(rule)
      if (!name) return
      const newItem = createNewItem(name, rule, $items.length + counter)
      newItems.push(newItem)
      counter++
    })

    return newItems
  }

  function getTypeName(content) {
    const regex = new RegExp(/rule\("(.*)"\)/g)
    const match = regex.exec(content)

    if (!match) return

    return match[1]
  }

  function submit() {
    if (replaceScript) $items = []

    const settings = findSettings()
    const rules = findAllRules()

    const newItems = [settings, ...rules].filter(i => i)

    $items = [...$items, ...newItems]
    active = false
  }
</script>

<button class="button button--secondary button--square" on:click={() => active = true}>Import Script</button>

{#if active}
  <div class="modal" transition:fade={{ duration: 100 }} use:escapeable on:escape={() => active = false} data-hide-on-close>
    <div class="modal__content">
      Copy your snippet from inside of Overwatch and paste it in here to convert your current snippet to this project.

      <textarea class="form-input form-textarea form-textarea--extra-small mt-1/4" bind:value />

      <div class="switch-checkbox mt-1/4">
        <input
          id="replace-script"
          class="switch-checkbox__input"
          autocomplete="off"
          type="checkbox"
          bind:checked={replaceScript}>

        <label
          class="switch-checkbox__label"
          for="replace-script">
          Replace entire script
        </label>
      </div>

      <button class="button w-100 mt-1/4" on:click={submit} disabled={!value}>Import</button>
    </div>

    <div class="modal__backdrop" on:click={() => active = false} />
  </div>
{/if}

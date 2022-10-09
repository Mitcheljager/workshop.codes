<script>
  import { items } from "../../stores/editor"
  import { createNewItem } from "../../utils/editor"
  import { fade } from "svelte/transition"

  let active = false
  let replaceScript = false
  let value = ""

  function getSettings() {
    const regex = new RegExp(/settings/)
    const match = regex.exec(value)
    if (!match) return

    const untilIndex = getClosingBracket(value.slice(match.index, value.length))
    if (!untilIndex) return

    return createNewItem("Settings", value.slice(match.index, untilIndex + 1), $items.length)
  }

  function getAllRules() {
    const rules = value.split(/(?=rule\()/g)
    const newItems = []

    rules.forEach((rule, i) => {
      const name = getTypeName(rule)
      if (!name) return
      const newItem = createNewItem(name, rule, $items.length + 1 + i)
      newItems.push(newItem)
    })

    return newItems
  }

  function getClosingBracket(content) {
    let closePos = 0
    let counter = 1
    let initial = true

    while (counter > 1 || initial) {
      let c = content[++closePos]
      if (c == "{") {
        counter++
        initial = false
      }
      else if (c == "}") counter--
      if (counter > 5 || closePos > 10000) counter = 0
    }

    return closePos
  }

  function getTypeName(content) {
    const regex = new RegExp(/rule\("(.*)"\)/g)
    const match = regex.exec(content)

    if (!match) return

    return match[1]
  }

  function submit() {
    const settings = getSettings()
    const rules = getAllRules()
    const previous = replaceScript ? [] : $items

    const newItems = [settings, ...rules].filter(i => i)

    $items = [...previous, ...newItems]
    active = false
  }
</script>

<svelte:window on:keydown={event => { if (event.key === "Escape") active = false }} />

<button class="button button--secondary" on:click={() => active = true}>Import Script</button>

{#if active}
  <div class="modal" transition:fade={{ duration: 100 }} data-hide-on-close>

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

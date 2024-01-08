<script>
  import Modal from "./Modal.svelte"
  import { items, modal } from "../../../stores/editor"
  import { createNewItem } from "../../../utils/editor"
  import { getClosingBracket, getSettings } from "../../../utils/parse"
  import { submittable } from "../../actions/submittable"
  import { onMount } from "svelte"

  let replaceScript = false
  let value = ""
  let disallowSubmit

  onMount(() => {
    value = ""
  })

  $: disallowSubmit = !value

  function findSettings() {
    const [start, end] = getSettings(value)

    if (!(start || end)) return

    return createNewItem("Settings", value.slice(start, end), $items.length)
  }

  function findAllRules() {
    const regex = /(?:disabled\s+)?rule\s*\("(.*)"\)\s*{/g

    const newItems = []
    let counter = 0
    let match = null
    while ((match = regex.exec(value)) != null) {
      const name = match[1]

      const openBracket = match.index + match[0].length - 1
      let end = getClosingBracket(value, "{", "}", openBracket - 1)
      if (end === -1) end = value.length

      const rule = value.substring(match.index, end + 1)

      const newItem = createNewItem(name, rule, $items.length + counter)
      newItems.push(newItem)
      counter++
    }

    return newItems
  }

  function submit() {
    if (disallowSubmit) return

    if (replaceScript) $items = []

    const settings = findSettings()
    const rules = findAllRules()

    const newItems = [settings, ...rules].filter(i => i)

    $items = [...$items, ...newItems]
    modal.close()
  }
</script>

<Modal>
  Copy your snippet from inside of Overwatch and paste it in here to convert your current snippet to this project.

  <textarea
    class="form-input form-textarea form-textarea--extra-small mt-1/4"
    bind:value
    use:submittable
    on:submit={submit} />

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

  <button class="button w-100 mt-1/4" on:click={submit} disabled={disallowSubmit}>Import</button>
</Modal>

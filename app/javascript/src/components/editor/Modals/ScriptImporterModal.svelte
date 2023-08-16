<script>
  import Modal from "./Modal.svelte"
  import { items, modal } from "../../../stores/editor"
  import { createNewItem } from "../../../utils/editor"
  import { getSettings } from "../../../utils/parse"
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
    const rules = value.split(/(?=(?:disabled\s+)?rule\s*\()/g)
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
    const regex = new RegExp(/rule\s*\("(.*)"\)/g)
    const match = regex.exec(content)

    if (!match) return

    return match[1]
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

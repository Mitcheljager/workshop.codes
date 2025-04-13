<script>
  import Modal from "@components/editor/Modals/Modal.svelte"
  import { items, modal } from "@stores/editor"
  import { createNewItem, updateItem } from "@utils/editor"
  import { getClosingBracket, getSettings, replaceBetween } from "@utils/parse"
  import { submittable } from "@components/actions/submittable"
  import { onMount } from "svelte"

  const modes = {
    append: "append",
    replaceAll: "replace-all",
    replaceSettings: "replace-settings"
  }

  let mode = modes.append
  let value = ""
  let disallowSubmit

  onMount(() => {
    value = ""
  })

  $: disallowSubmit = !value

  function findSettings() {
    const [start, end] = getSettings(value)

    if (!(start || end)) return

    return createNewItem("Settings", value.slice(start, end), -1)
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

    const settings = findSettings()

    if (mode === modes.replaceSettings) {
      if (!settings) {
        alert("No settings found in snippet")
        return
      }

      let hasReplacedSettings = false

      $items.forEach(item => {
        const [start, end] = getSettings(item.content)

        if (!(start || end)) return

        hasReplacedSettings = true
        updateItem({ ...item, content: replaceBetween(item.content, settings.content, start, end) })
      })

      if (!hasReplacedSettings) $items = [settings, ...$items]
    } else {
      if (mode === modes.replaceAll) $items = []

      const rules = findAllRules()
      const newItems = [(settings || {}), ...rules].filter(i => i)

      $items = [...$items, ...newItems]
    }

    modal.close()
  }
</script>

<Modal>
  Copy your snippet from inside of Overwatch and paste it in here to convert your current snippet to this project.

  <textarea
    class="form-input form-textarea form-textarea--extra-small mt-1/4"
    bind:value
    use:submittable
    on:submit={submit}></textarea>

  <div class="checkbox mt-1/4">
    <input type="radio" name="mode" value={modes.append} bind:group={mode} id={modes.append} />
    <label for={modes.append}>Add to end of script</label>
  </div>

  <div class="checkbox">
    <input type="radio" name="mode" value={modes.replaceAll} bind:group={mode} id={modes.replaceAll} />
    <label for={modes.replaceAll}>Replace entire script</label>
  </div>

  <div class="checkbox">
    <input type="radio" name="mode" value={modes.replaceSettings} bind:group={mode} id={modes.replaceSettings} />
    <label for={modes.replaceSettings}>Replace settings only</label>
  </div>

  <button class="button w-100 mt-1/4" on:click={submit} disabled={disallowSubmit}>Import</button>
</Modal>

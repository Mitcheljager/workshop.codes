<script lang="ts">
  import { addAlert } from "@src/lib/alerts"
  import { currentItem, editorStates, items } from "@src/stores/editor"
  import { defaultLanguage, selectedLanguages, translationKeys } from "@src/stores/translationKeys"
  import { updateProjectContent } from "@src/utils/project"

  function exportAsJson(): void {

    const json = JSON.stringify({
      items: $items,
      translations: {
        keys: $translationKeys,
        selectedLanguages: $selectedLanguages,
        defaultLanguage: $defaultLanguage
      }
    })

    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const linkElement = document.createElement("a")

    linkElement.href = url
    linkElement.download = "data.json"
    linkElement.click()

    URL.revokeObjectURL(url)
  }

  function importFromJson(event: Event): void {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    try {
      if (!file || file.type !== "application/json") throw new Error("A JSON file is required")
      if (file.size > 1_000_000) throw new Error("File too large, you may have uploaded something invalid")

      const reader = new FileReader()

      reader.readAsText(file, "UTF-8")
      reader.onload = ({ target }) => {
        try {
          if (typeof target?.result !== "string") throw new Error("Invalid file result in JSON import")

          const json = JSON.parse(target.result)

          if (!json?.items) throw new Error("Invalid result in JSON import")

          $editorStates = {}

          updateProjectContent(target.result)

          $currentItem = { ...($items[0] || {}), forceUpdate: true }
        } catch (error: any) {
          console.error(error.message)
          addAlert(error, ["alert--error"])
        }
      }
    } catch (error: any) {
      console.error(error)
      addAlert(error.message, ["alert--error"])
    }
  }
</script>

<div class="mt-1/8">
  <button class="button button--link button--small p-0" onclick={exportAsJson}>Export project as JSON</button>

  <label>
    <div class="button button--link button--small p-0">Import from JSON</div>
    <input type="file" class="hidden-field" onchange={importFromJson} />
  </label>
</div>

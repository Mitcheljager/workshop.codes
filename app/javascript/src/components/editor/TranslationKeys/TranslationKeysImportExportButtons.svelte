<script lang="ts">
  import { addAlert } from "@src/lib/alerts"
  import { languageOptions } from "@src/lib/languageOptions"
  import type papaparse from "papaparse"
  import type { Language, TranslationKey } from "@src/types/editor"
  import { selectedLanguages, translationKeys } from "@src/stores/translationKeys"

  const DELIMITER_TO_FILE_TYPE = new Map([
    [",", "CSV"],
    ["\t", "TSV"],
    [null, "TSV/CSV"]
  ])

  async function importKeysFromClipboard() {
    const papaparse = await import("papaparse")

    const clipboardText = await navigator.clipboard.readText()

    if (!clipboardText?.trim()) {
      addAlert("Cannot import translation keys:\nNothing in clipboard", ["alert--warning"])
      return
    }

    const newSelectedLanguages: Language[] = []

    let parseResult: papaparse.ParseResult<TranslationKey & { key: string }>
    try {
      parseResult = papaparse.parse(clipboardText, {
        header: true,
        skipEmptyLines: true,
        delimitersToGuess: Array.from(DELIMITER_TO_FILE_TYPE.keys()).filter((delimiter): delimiter is string => !!delimiter)
      })
    } catch (error) {
      console.error("Failed to parse CSV/TSV from clipboard", error)
      addAlert(`Cannot import translation keys:\n${error?.toString()}`, ["alert--error"])
      return
    }

    const formatError = (error: papaparse.ParseError) =>
      `${error.index != null || error.row != null
        ? `At ${error.index != null ? `index ${error.index}` : `row ${error.row}`}: `
        : ""
      }${error?.message}`

    if (!parseResult.data || !parseResult.meta.fields) {
      addAlert(`Cannot import translation keys:\n${parseResult.errors[0] ? formatError(parseResult.errors[0]) : "Unknown error"}`, ["alert--error"])
      return
    }

    const fileType = DELIMITER_TO_FILE_TYPE.get(parseResult.meta.delimiter || null)

    if (parseResult.meta.fields.length === 0) {
      addAlert(`Cannot import translation keys:\n${fileType} provided is completely empty`, ["alert--warning"])
      return
    }

    if (!parseResult.meta.fields.includes("key")) {
      addAlert(`Cannot import translation keys:\nNo \`key\` header in the ${fileType} provided`, ["alert--error"])
      return
    }

    for (const field of parseResult.meta.fields) {
      if (field === "key") {
        continue
      }

      if (!(field in languageOptions)) {
        addAlert(`Cannot import translation keys:\nUnknown language "${field}"`, ["alert--error"])
        return
      }

      newSelectedLanguages.push(field as Language)
    }

    if (parseResult.data.length === 0) {
      const confirmation = confirm(`There are no entries in the ${fileType} provided. This will delete all translation keys.\nAre you sure?`)
      if (!confirmation) return
    }

    if (parseResult.errors.length > 0) {
      // There are errors, but parsing was still successful => errors are just warnings

      addAlert(`There may be issues with the ${fileType} provided!\n${formatError(parseResult.errors[0])}`, ["alert--warning"])
    }

    $selectedLanguages = newSelectedLanguages
    $translationKeys = parseResult.data.reduce((newKeys, entry) => {
      const { key, ... translations } = entry
      newKeys[key] = translations

      return newKeys
    }, {} as Record<string, TranslationKey>)

    addAlert("Translation keys successfully imported from clipboard!")
  }

  async function exportKeys() {
    const papaparse = await import("papaparse")

    const jsonToExport = Object.entries($translationKeys).map(([key, translations]) => ({
      key,
      ... translations
    }))

    navigator.clipboard.writeText(
      papaparse.unparse(jsonToExport, {
        columns: ["key", ...$selectedLanguages],
        delimiter: "\t"
      })
    )

    addAlert("Translation keys copied to clipboard")
  }
</script>

<div {...$$props} class={["button-group", $$props.class]}>
  <button on:click={() => importKeysFromClipboard()} class="button button--small button--secondary button--square w-100" data-tooltip="From CSV/TSV in your clipboard">Import</button>
  <button on:click={() => exportKeys()} class="button button--small button--secondary button--square w-100" data-tooltip="To TSV (for Excel)">Export</button>
</div>

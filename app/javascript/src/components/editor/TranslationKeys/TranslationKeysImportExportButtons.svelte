<script lang="ts">
  import { addAlert } from "@src/lib/alerts"
  import { languageOptions } from "@src/lib/languageOptions"
  import { selectedLanguages, translationKeys } from "@src/stores/translationKeys"
  import { outsideClick } from "@components/actions/outsideClick"
  import { escapeable } from "@src/components/actions/escapeable"
  import { showOpenFilePicker, showSaveFilePicker } from "@src/utils/files"
  import { currentProject } from "@src/stores/editor"
  import type papaparse from "papaparse"
  import type { Language, TranslationKey } from "@src/types/editor"

  enum DropdownType {
    IMPORT,
    EXPORT
  }

  let openDropdown: DropdownType | null = null

  const closeDropdown = () => { openDropdown = null }

  enum FileType {
    CSV = "CSV",
    TSV = "TSV"
  }

  interface FileTypeData {
    name: string
    delimiter: string
    extension: string
  }

  const FILE_TYPE_DATA: Record<FileType, FileTypeData> = {
    [FileType.CSV]: {
      name: "CSV",
      delimiter: ",",
      extension: "csv"
    },
    [FileType.TSV]: {
      name: "TSV",
      delimiter: "\t",
      extension: "tsv"
    }
  }
  const FILE_TYPES = Object.keys(FILE_TYPE_DATA) as FileType[]

  // #region Import
  async function importKeysFromText(inputText: string): Promise<void> {
    const papaparse = await import("papaparse")

    const newSelectedLanguages: Language[] = []

    let parseResult: papaparse.ParseResult<TranslationKey & { key: string }>
    try {
      parseResult = papaparse.parse(inputText, {
        header: true,
        skipEmptyLines: true,
        delimitersToGuess: Object.values(FILE_TYPE_DATA).map(({ delimiter }) => delimiter)
      })
    } catch (error) {
      console.error("Failed to parse input text", error)
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

    const fileTypeName =
      FILE_TYPES.find((fileType) => FILE_TYPE_DATA[fileType].delimiter === parseResult.meta.delimiter) ??
      Object.values(FILE_TYPE_DATA).map(({ name }) => name).join("/")

    if (parseResult.meta.fields.length === 0) {
      addAlert(`Cannot import translation keys:\n${fileTypeName} provided is completely empty`, ["alert--warning"])
      return
    }

    if (!parseResult.meta.fields.includes("key")) {
      addAlert(`Cannot import translation keys:\nNo \`key\` header in the ${fileTypeName} provided`, ["alert--error"])
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
      const confirmation = confirm(`There are no entries in the ${fileTypeName} provided. This will delete all translation keys.\nAre you sure?`)
      if (!confirmation) return
    }

    if (parseResult.errors.length > 0) {
      // There are errors, but parsing was still successful => errors are just warnings

      addAlert(`There may be issues with the ${fileTypeName} provided!\n${formatError(parseResult.errors[0])}`, ["alert--warning"])
    }

    $selectedLanguages = newSelectedLanguages
    $translationKeys = parseResult.data.reduce((newKeys, entry) => {
      const { key, ... translations } = entry
      newKeys[key] = translations

      return newKeys
    }, {} as Record<string, TranslationKey>)

    addAlert("Translation keys successfully imported!")
  }

  async function importKeysFromClipboard(): Promise<void> {
    const clipboardText = await navigator.clipboard.readText()

    if (!clipboardText?.trim()) {
      addAlert("Cannot import translation keys:\nNothing in clipboard", ["alert--warning"])
      return
    }

    return importKeysFromText(clipboardText)
  }

  async function importKeysFromFile(): Promise<void> {
    const file = await showOpenFilePicker({
      accept: [".txt", ... FILE_TYPES.map((fileType) => `.${FILE_TYPE_DATA[fileType].extension}`)]
    })

    if (file == null) {
      return
    }

    const fileText = await file.text()

    return importKeysFromText(fileText)
  }
  // #endregion Import

  // #region Export
  async function exportKeysAsText(fileType: FileType): Promise<string> {
    const papaparse = await import("papaparse")

    const jsonToExport = Object.entries($translationKeys).map(([key, translations]) => ({
      key,
      ... translations
    }))

    const textToExport = papaparse.unparse(jsonToExport, {
      columns: ["key", ...$selectedLanguages],
      delimiter: FILE_TYPE_DATA[fileType].delimiter
    })

    return textToExport
  }

  async function exportKeysToClipboard(fileType: FileType): Promise<void> {
    const textToExport = await exportKeysAsText(fileType)

    await navigator.clipboard.writeText(textToExport)

    addAlert(`Translation keys copied to clipboard as ${fileType}`)
  }

  async function exportKeysToFile(fileType: FileType): Promise<void> {
    const textToExport = await exportKeysAsText(fileType)

    const fileTypeExtension = FILE_TYPE_DATA[fileType].extension
    showSaveFilePicker(`${$currentProject!.title} translations.${fileTypeExtension}`, new Blob([textToExport], { type: `text/${fileTypeExtension}` }))
  }
  // #endregion Export
</script>

<div {...$$props} class={["button-group", $$props.class]}>
  <div class="dropdown w-100" use:outsideClick={{ onOutsideClick: closeDropdown }}>
    <button aria-label="Import translation keys" class="button button--small button--secondary button--square w-100" on:click={() => openDropdown = DropdownType.IMPORT}>
      Import...
    </button>

    {#if openDropdown === DropdownType.IMPORT}
      <div use:escapeable={{ onescape: closeDropdown }} class="dropdown__content dropdown__content--center block w-100" style="width: 200px">
        <button class="dropdown__item" on:click={() => importKeysFromFile()}>
          from a {FILE_TYPES.map((fileType) => `.${FILE_TYPE_DATA[fileType].extension}`).join("/")} file
        </button>

        <button class="dropdown__item" on:click={() => importKeysFromClipboard()}>
          from clipboard ({FILE_TYPES.map((fileType) => FILE_TYPE_DATA[fileType].name).join("/")} format)
        </button>
      </div>
    {/if}
  </div>

  <div class="dropdown w-100" use:outsideClick={{ onOutsideClick: closeDropdown }}>
    <button aria-label="Import translation keys" class="button button--small button--secondary button--square w-100" on:click={() => openDropdown = DropdownType.EXPORT}>
      Export...
    </button>

    {#if openDropdown === DropdownType.EXPORT}
      <div use:escapeable={{ onescape: closeDropdown }} class="dropdown__content dropdown__content--center block w-100" style="width: 200px">
        {#each FILE_TYPES as fileType}
          <button class="dropdown__item" on:click={() => exportKeysToFile(fileType)}>
            to a .{FILE_TYPE_DATA[fileType].extension} file
          </button>
        {/each}

        <hr />

        {#each FILE_TYPES as fileType}
          <button class="dropdown__item" on:click={() => exportKeysToClipboard(fileType)}>
            to clipboard as a {FILE_TYPE_DATA[fileType].name}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>

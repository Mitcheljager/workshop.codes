<script lang="ts">
  import Modal from "@components/editor/Modals/Modal.svelte"
  import TranslationKeysEditStrings from "@components/editor/TranslationKeys/TranslationKeysEditStrings.svelte"
  import TranslationKeysSelectLanguages from "@components/editor/TranslationKeys/TranslationKeysSelectLanguages.svelte"
  import { translationKeys, orderedTranslationKeys, selectedLanguages } from "@stores/translationKeys"
  import { copyValueToClipboard } from "@src/copy"
  import { submittable } from "@components/actions/submittable"
  import { addAlert } from "@src/lib/alerts"
  import papaparse from "papaparse"
  import { languageOptions } from "@src/lib/languageOptions"
  import type { Language, TranslationKey } from "@src/types/editor"

  export let initialSelectedKey

  let selectedKey = initialSelectedKey
  let showLanguageSettings = false
  let error = ""
  let newKeyInput: HTMLInputElement

  function addKey() {
    error = ""

    const value = newKeyInput?.value.trim()
    if (!value) return

    if ($translationKeys[value]) {
      error = "Key already taken"
      return
    }

    $translationKeys[value] = {}
    selectedKey = value
    newKeyInput.value = ""
  }

  const DELIMITER_TO_FILE_TYPE = new Map([
    [",", "CSV"],
    ["\t", "TSV"],
    [null, "TSV/CSV"]
  ])

  async function importKeysFromClipboard() {
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

<Modal maxWidth="clamp(300px, 90vw, 900px)" flush>
  <div class="bg-darker br-top p-1/4">
    <h2 class="mt-0 mb-1/4">Translation settings</h2>
    <p class="mb-0">Translation keys allow you to insert a Key in place of a Custom String. You can set up translations and the key will automatically be translated based on the player's game language.</p>
  </div>

  <div class="translation-settings">
    <div class="translation-settings__aside">
      <button on:click={() => { showLanguageSettings = true; selectedKey = null }} class="button button--secondary button--square button--small text-base w-100">
        Select languages ({$selectedLanguages.length})
      </button>

      {#if Object.keys($orderedTranslationKeys).length}
        <h4 class="mb-1/8"><strong>Keys</strong></h4>

        <div>
          {#each Object.keys($orderedTranslationKeys) as key}
            <div
              class="translation-settings__item"
              class:translation-settings__item--active={selectedKey == key}>
              <button on:click={() => { selectedKey = key; showLanguageSettings = false }}>
                {key}
              </button>

              <button class="translation-settings__copy" on:click={() => copyValueToClipboard(key)}>Copy</button>
            </div>
          {/each}
        </div>
      {/if}

      <div class="translation-settings__create">
        <label class="form-label text-small" for="">Create new key</label>
        <input
          bind:this={newKeyInput}
          class="form-input"
          type="text"
          placeholder="Some Translation Key..."
          use:submittable
          on:submit={addKey}
        />

        {#if error}
          <div class="text-red mt-1/8 text-small">{error}</div>
        {/if}

        <button on:click={addKey} class="button button--small button--square w-100 mt-1/8">Create</button>

        <div class="button-group mt-1/4">
          <button on:click={() => importKeysFromClipboard()} class="button button--small button--secondary button--square w-100" data-tooltip="From CSV/TSV in your clipboard">Import</button>
          <button on:click={() => exportKeys()} class="button button--small button--secondary button--square w-100" data-tooltip="To TSV (for Excel)">Export</button>
        </div>
      </div>
    </div>

    <div class="translation-settings__content">
      {#if showLanguageSettings}
        <TranslationKeysSelectLanguages />
      {:else if selectedKey}
        <TranslationKeysEditStrings {selectedKey} on:updateKey={({ detail }) => selectedKey = detail} on:removeKey={() => selectedKey = null} />
      {:else}
        <em>Select or create a key to set up your translations.</em>
      {/if}
    </div>
  </div>
</Modal>

<script lang="ts">
  import Modal from "@components/editor/Modals/Modal.svelte"
  import TranslationKeysEditStrings from "@components/editor/TranslationKeys/TranslationKeysEditStrings.svelte"
  import TranslationKeysSelectLanguages from "@components/editor/TranslationKeys/TranslationKeysSelectLanguages.svelte"
  import { translationKeys, orderedTranslationKeys, selectedLanguages } from "@stores/translationKeys"
  import { copyValueToClipboard } from "@src/copy"
  import { submittable } from "@components/actions/submittable"
  import TranslationKeysImportExportButtons from "../TranslationKeys/TranslationKeysImportExportButtons.svelte"

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
</script>

<Modal maxWidth="clamp(300px, 90vw, 900px)" flush>
  <div class="bg-darker br-top p-1/4">
    <h2 class="mt-0 mb-1/4">Translation settings</h2>
    <p class="mb-0">Translation keys allow you to insert a Key in place of a Custom String. You can set up translations and the key will automatically be translated based on the player's game language.</p>
  </div>

  <div class="translation-settings">
    <div class="translation-settings__aside">
      <button on:click={() => showLanguageSettings = !showLanguageSettings} class="button button--secondary button--square button--small text-base w-100">
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

        <TranslationKeysImportExportButtons class="mt-1/4" />
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

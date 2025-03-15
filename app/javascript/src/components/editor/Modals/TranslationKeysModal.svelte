<script lang="ts">
  import Modal from "@components/editor/Modals/Modal.svelte"
  import TranslationKeysEditStrings from "@components/editor/TranslationKeys/TranslationKeysEditStrings.svelte"
  import TranslationKeysSelectLanguages from "@components/editor/TranslationKeys/TranslationKeysSelectLanguages.svelte"
  import { orderedTranslationKeys, selectedLanguages } from "@stores/translationKeys"
  import { copyValueToClipboard } from "@src/copy"
  import { newTranslationKey } from "@src/lib/translations"
  import Copy from "@src/components/icon/Copy.svelte"
  import TranslationKeysImportExportButtons from "@src/components/editor/TranslationKeys/TranslationKeysImportExportButtons.svelte"

  export let initialSelectedKey

  let selectedKey = initialSelectedKey
  let showLanguageSettings = false
</script>

<Modal maxWidth="clamp(300px, 90vw, 900px)" internalScrolling flush>
  <div class="bg-darker br-top p-1/4">
    <h2 class="mt-0 mb-1/4">Translation settings</h2>
    <p class="mb-0">Translation keys allow you to insert a Key in place of a Custom String. You can set up translations and the key will automatically be translated based on the player's game language.</p>
  </div>

  <div class="translation-settings">
    <div class="translation-settings__aside">
      <button on:click={() => showLanguageSettings = !showLanguageSettings} class="button button--secondary button--square button--small text-base w-100">
        Select languages ({$selectedLanguages.length})
      </button>

      <h4 class="flex align-center justify-between mb-1/8">
        <strong>Keys</strong>
        <button class="button button--primary button--small button--square" on:click={() => { selectedKey = newTranslationKey; showLanguageSettings = false }}>Add</button>
      </h4>

      <div class="translation-settings__keys-container">
        {#each Object.keys($orderedTranslationKeys) as key}
          <div
            class="translation-settings__item"
            class:translation-settings__item--active={selectedKey === key}>
            <button class="translation-settings__item-label" on:click={() => { selectedKey = key; showLanguageSettings = false }}>
              {key}
            </button>

            <button class="translation-settings__copy" on:click={() => copyValueToClipboard(key)}><Copy width="16" /></button>
          </div>
        {:else}
          <p class="m-0">No keys</p>
        {/each}
      </div>

      <TranslationKeysImportExportButtons class="mt-1/4" />
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

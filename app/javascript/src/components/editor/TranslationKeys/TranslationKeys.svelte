<script>
  import TranslationKeysEditStrings from "./TranslationKeysEditStrings.svelte"
  import TranslationKeysSelectLanguages from "./TranslationKeysSelectLanguages.svelte"
  import { translationKeys, orderedTranslationKeys, selectedLanguages } from "../../../stores/editor"
  import { languageOptions } from "../../../lib/languageOptions"
  import { copyValueToClipboard } from "../../../copy"
  import { fade, fly } from "svelte/transition"

  let active = true
  let selectedKey = null
  let showLanguageSettings = false
  let newKeyInput

  function addKey() {
    const value = newKeyInput?.value
    if (!value) return

    $translationKeys[value] = {}
    selectedKey = value
    newKeyInput.value = ""
  }
</script>

<svelte:window on:keydown={event => { if (event.key === "Escape") active = false }} />

<button class="button button--secondary button--square text-left" on:click={() => active = true}>
  Translations
</button>

{#if active}
  <div class="modal modal--top" transition:fade={{ duration: 100 }} data-ignore>
    <div class="modal__content" style="max-width: 80vw;" transition:fly={{ y: 100, duration: 200 }}>
      <h2 class="mt-0">Translation settings</h2>

      <p>Translation keys allow you to insert a Key in place of a Custom String. You can set up translations and the key will automatically be translated based on the player's game language.</p>

      <div class="translation-settings mt-1/2">
        <div class="translation-settings__aside">
          <button on:click={() => { showLanguageSettings = true; selectedKey = null }} class="button button--secondary button--square button--small text-base w-100">
            Select languages ({$selectedLanguages.length})
          </button>

          <h4 class="mb-1/8">Keys</h4>

          <div>
            {#each Object.keys($orderedTranslationKeys) as key}
              <button
                class="translation-settings__item"
                class:translation-settings__item--active={selectedKey == key}
                on:click={() => { selectedKey = key; showLanguageSettings = false }}>
                {key}
                <div class="translation-settings__copy" on:click={() => copyValueToClipboard(key)}>Copy</div>
              </button>
            {/each}
          </div>

          <div class="well well--dark block p-1/4 mt-1/4">
            <label class="form-label text-small" for="">Create new key</label>
            <input bind:this={newKeyInput} class="form-input" type="text" placeholder="Some Translation Key..." />
            <button on:click={addKey} class="button button--secondary button--small w-100 mt-1/8">Create</button>
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
    </div>

    <div class="modal__backdrop" on:click={() => active = false} />
  </div>
{/if}

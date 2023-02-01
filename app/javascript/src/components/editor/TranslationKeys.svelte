<script>
  import { translationKeys, selectedLanguages, defaultLanguage } from "../../stores/editor"
  import { copyValueToClipboard } from "../../copy"
  import { fade, fly } from "svelte/transition"

  const languageOptions = {
    en: "English",
    sp: "Spanish",
    fr: "French",
    pt: "Portuguese"
  }

  let active = false
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
            {#each Object.entries($translationKeys) as [key]}
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
            <p class="mt-0">Select all languages you wish to add translations for. If you do not enter a translations for a given key the default language will be used instead.</p>

            {#each Object.entries(languageOptions) as [key, value]}
              <div class="checkbox">
                <input type="checkbox" bind:group={$selectedLanguages} value={key} id="option_{key}" />
                <label for="option_{key}">
                  {value}

                  {#if key == $defaultLanguage}
                    <small class="text-base">(Current default)</small>
                  {:else if $selectedLanguages.includes(key)}
                    <small class="text-base" on:click|preventDefault|stopPropagation={() => $defaultLanguage = key}>Set as default</small>
                  {/if}
                </label>
              </div>
            {/each}
          {:else if selectedKey}
            {#each $selectedLanguages as language}
              <div class="form-group-inline mb-1/8">
                <label for="">{languageOptions[language]}</label>

                <textarea class="form-input form-textarea form-textarea--extra-small" bind:value={$translationKeys[selectedKey][language]} />
              </div>
            {/each}
          {:else}
            <em>Select or create a key to set up your translations.</em>
          {/if}
        </div>
      </div>
    </div>

    <div class="modal__backdrop" on:click={() => active = false} />
  </div>
{/if}

<script>
  import Modal from "@components/editor/Modals/Modal.svelte"
  import TranslationKeysEditStrings from "@components/editor/TranslationKeys/TranslationKeysEditStrings.svelte"
  import TranslationKeysSelectLanguages from "@components/editor/TranslationKeys/TranslationKeysSelectLanguages.svelte"
  import { translationKeys, orderedTranslationKeys, selectedLanguages } from "@stores/translationKeys"
  import { copyValueToClipboard } from "@src/copy"
  import { submittable } from "@components/actions/submittable"

  let selectedKey = null
  let showLanguageSettings = false
  let error = ""
  let newKeyInput

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
      <button on:click={() => { showLanguageSettings = true; selectedKey = null }} class="button button--secondary button--square button--small text-base w-100">
        Select languages ({$selectedLanguages.length})
      </button>

      {#if Object.keys($orderedTranslationKeys).length}
        <h4 class="mb-1/8"><strong>Keys</strong></h4>

        <div>
          {#each Object.keys($orderedTranslationKeys) as key}
            <button
              class="translation-settings__item"
              class:translation-settings__item--active={selectedKey == key}
              on:click={() => { selectedKey = key; showLanguageSettings = false }}>
              {key}
              <!-- svelte-ignore a11y_click_events_have_key_events -->
              <!-- svelte-ignore a11y_no_static_element_interactions -->
              <div class="translation-settings__copy" on:click={() => copyValueToClipboard(key)}>Copy</div>
            </button>
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

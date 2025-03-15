<script>
  import { translationKeys, selectedLanguages } from "@stores/translationKeys"
  import { languageOptions } from "@lib/languageOptions"
  import { submittable } from "@components/actions/submittable"
  import { createEventDispatcher } from "svelte"
  import debounce from "@src/debounce"
  import { newTranslationKey } from "@src/lib/translations"

  export let selectedKey

  const dispatch = createEventDispatcher()

  let createNewKeyMode
  let createOrRenameInput
  let error = ""
  let selectedKeyNameInExamples

  $: createNewKeyMode = selectedKey === newTranslationKey

  $: if (createNewKeyMode && createOrRenameInput) createOrRenameInput.focus()

  const createOrRenameKey = () => {
    error = ""

    const value = createOrRenameInput.value.trim()

    if (value === selectedKey) return

    if (!value) {
      error = "Key can't be empty"
      return
    }

    if ($translationKeys[value]) {
      error = "Key already taken"
      return
    }

    translationKeys.update((translationKeys) => {
      const previousKeys = createNewKeyMode ? {} : translationKeys[selectedKey]

      if (!createNewKeyMode)
        delete translationKeys[selectedKey]

      translationKeys[value] = previousKeys

      return translationKeys
    })

    dispatch("updateKey", value)
  }

  const removeKey = () => {
    if (!confirm("Are you sure?")) return

    delete $translationKeys[selectedKey]
    $translationKeys = { ...$translationKeys }

    dispatch("removeKey")
  }
</script>

<div class="sticky top-0 well well--dark block p-1/4 mb-1/4">
  <div class="flex gap-1/4 align-center">
    <!--
    NOTE: either on:input or on:change are registered here for better user experience:
    - When creating a new key, the key won't be created until the user has pressed the Enter key (or moved focus away from the input)
    - But when editing an already existing key, the explicit submission shouldn't be required (like with the translation <textarea>s below)
      - The event handler is still debounced to prevent too many changes to the UI
    -->
    <input
      class="form-input"
      value={createNewKeyMode ? "" : selectedKey}
      bind:this={createOrRenameInput}
      on:input={!createNewKeyMode ? debounce(createOrRenameKey, 300) : null}
      on:change={createNewKeyMode ? createOrRenameKey : null} />
    <button class="button button--danger button--small button--square" on:click={removeKey}>Remove</button>
  </div>

  {#if createNewKeyMode}
    <div class="text-orange mt-1/8">Give your translation a key</div>
  {:else if error}
    <div class="text-red mt-1/8">{error}</div>
  {/if}
</div>

{#if selectedKey}
  {@const selectedKeyNameInExamples = createNewKeyMode ? "…" : selectedKey}
  <p class="text-small mb-0">
    Include this key in your project using
    <code style="color: var(--color-punctuation)">
      <span style="color: var(--color-custom-keyword)">@translate</span>(<span style="color: var(--color-string)">"{selectedKeyNameInExamples}"</span>)
    </code>
  </p>

  <p class="text-small mt-1/8 mb-0">
    Include optional parameters just like you would when using <code>Custom String</code>
  </p>

  <code class="inline-block mt-1/8 text-small" style="color: var(--color-punctuation)">
    <span style="color: var(--color-custom-keyword)">@translate</span>(<span style="color: var(--color-string)">"{selectedKeyNameInExamples}"</span>,
    <span style="color: var(--color-value)">Icon String</span>(<span style="color: var(--color-variable)">Bolt</span>))
  </code>

  <code class="inline-block mt-1/8 text-small">
    Some translation &#123;0&#125; with an icon in the middle
  </code>

  <p class="text-small mb-0">
    Include this key as a static string replacement using
    <code style="color: var(--color-punctuation)">
      <span style="color: var(--color-custom-keyword)">@translate</span><span style="color: var(--color-variable)">.static</span>(<span style="color: var(--color-string)">"{selectedKeyNameInExamples}"</span>)
    </code>
  </p>
{/if}

<hr class="mt-1/4 mb-1/4">

{#if !createNewKeyMode && $translationKeys[selectedKey]}
  {#each $selectedLanguages as language}
    <div class="form-group-inline mt-1/8">
      <label style="display: block !important" for="">{languageOptions[language] && languageOptions[language].name}</label> <!-- For some reason optional chaining doesn't work -->

      <textarea class="form-input form-textarea form-textarea--extra-small" bind:value={$translationKeys[selectedKey][language]}></textarea>
    </div>
  {/each}
{/if}

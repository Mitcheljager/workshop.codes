<script>
  import { translationKeys, selectedLanguages } from "../../../stores/translationKeys"
  import { languageOptions } from "../../../lib/languageOptions"
  import { submittable } from "../../actions/submittable"
  import { createEventDispatcher } from "svelte"

  export let selectedKey

  const dispatch = createEventDispatcher()

  let renameInput
  let error = ""

  function renameKey() {
    error = ""

    const value = renameInput.value.trim()

    if (value == selectedKey) return

    if (!value) {
      error = "Key can't be empty"
      return
    }

    if ($translationKeys[value]) {
      error = "Key already taken"
      return
    }

    delete Object.assign($translationKeys, { [value]: $translationKeys[selectedKey] })[selectedKey]
    $translationKeys = { ...$translationKeys }

    dispatch("updateKey", value)
  }

  function removeKey() {
    if (!confirm("Are you sure?")) return

    delete $translationKeys[selectedKey]
    $translationKeys = { ...$translationKeys }

    dispatch("removeKey")
  }
</script>

<div class="well well--dark block p-1/4 mb-1/4">
  <div class="form-group-uneven">
    <input class="form-input" value={selectedKey} bind:this={renameInput} use:submittable on:submit={renameKey} />

    <div class="flex justify-end">
      <button class="button button--secondary button--small button--square" on:click={renameKey}>Rename</button>
      <button class="button button--danger button--small button--square ml-1/8" on:click={removeKey}>Remove</button>
    </div>
  </div>

  {#if error}
    <div class="text-red mt-1/8">{error}</div>
  {/if}
</div>

<p class="text-small">
  Include this key in your project using
  <code style="color: var(--color-punctuation)">
    <span style="color: var(--color-custom-keyword)">@translate</span>(<span style="color: var(--color-string)">"{selectedKey}"</span>)
  </code>.
</p>

<p class="text-small">
  Include optional parameters just like you would when using <code>Custom String</code>.
  <br />
  <code class="inline-block mt-1/8" style="color: var(--color-punctuation)">
    <span style="color: var(--color-custom-keyword)">@translate</span>(<span style="color: var(--color-string)">"{selectedKey}"</span>,
    <span style="color: var(--color-value)">Icon String</span>(<span style="color: var(--color-variable)">Bolt</span>))
  </code>
  <br />
  <code class="inline-block mt-1/8">
    Some translation &#123;0&#125; with and icon in the middle
  </code>
</p>

{#if $translationKeys[selectedKey]}
  {#each $selectedLanguages as language}
    <div class="form-group-inline mb-1/8">
      <label style="display: block !important" for="">{languageOptions[language] && languageOptions[language].name}</label> <!-- For some reason optional chaining doesn't work -->

      <textarea class="form-input form-textarea form-textarea--extra-small" bind:value={$translationKeys[selectedKey][language]} />
    </div>
  {/each}
{/if}

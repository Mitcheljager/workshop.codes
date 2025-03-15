<script>
  import { translationKeys, selectedLanguages } from "@stores/translationKeys"
  import { languageOptions } from "@lib/languageOptions"
  import { submittable } from "@components/actions/submittable"
  import { createEventDispatcher } from "svelte"
  import debounce from "@src/debounce"

  export let selectedKey

  const dispatch = createEventDispatcher()

  let renameInput
  let error = ""

  const renameKey = debounce(() => {
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
  }, 300)

  const removeKey = () => {
    if (!confirm("Are you sure?")) return

    delete $translationKeys[selectedKey]
    $translationKeys = { ...$translationKeys }

    dispatch("removeKey")
  }
</script>

<div class="sticky top-0 well well--dark block p-1/4 mb-1/4">
  <div class="flex gap-1/4 align-center">
    <input class="form-input" value={selectedKey} bind:this={renameInput} on:input={renameKey} />
    <button class="button button--danger button--small button--square" on:click={removeKey}>Remove</button>
  </div>

  {#if error}
    <div class="text-red mt-1/8">{error}</div>
  {/if}
</div>

<p class="text-small mb-0">
  Include this key in your project using
  <code style="color: var(--color-punctuation)">
    <span style="color: var(--color-custom-keyword)">@translate</span>(<span style="color: var(--color-string)">"{selectedKey}"</span>)
  </code>
</p>

<p class="text-small mt-1/8 mb-0">
  Include optional parameters just like you would when using <code>Custom String</code>
</p>

<code class="inline-block mt-1/8 text-small" style="color: var(--color-punctuation)">
  <span style="color: var(--color-custom-keyword)">@translate</span>(<span style="color: var(--color-string)">"{selectedKey}"</span>,
  <span style="color: var(--color-value)">Icon String</span>(<span style="color: var(--color-variable)">Bolt</span>))
</code>

<code class="inline-block mt-1/8 text-small">
  Some translation &#123;0&#125; with an icon in the middle
</code>

<p class="text-small mb-0">
  Include this key as a static string replacement using
  <code style="color: var(--color-punctuation)">
    <span style="color: var(--color-custom-keyword)">@translate</span><span style="color: var(--color-variable)">.static</span>(<span style="color: var(--color-string)">"{selectedKey}"</span>)
  </code>
</p>

<hr class="mt-1/4 mb-1/4">

{#if $translationKeys[selectedKey]}
  {#each $selectedLanguages as language}
    <div class="form-group-inline mt-1/8">
      <label style="display: block !important" for="">{languageOptions[language] && languageOptions[language].name}</label> <!-- For some reason optional chaining doesn't work -->

      <textarea class="form-input form-textarea form-textarea--extra-small" bind:value={$translationKeys[selectedKey][language]}></textarea>
    </div>
  {/each}
{/if}

<script>
  import { selectedLanguages, defaultLanguage } from "../../../stores/translationKeys"
  import { languageOptions } from "../../../lib/languageOptions"
</script>

<p class="mt-0">Select all languages you wish to add translations for. If you do not enter a translations for a given key the default language will be used instead.</p>

{#each Object.entries(languageOptions) as [key, { name }]}
  <div class="checkbox">
    <input type="checkbox" bind:group={$selectedLanguages} value={key} id="option_{key}" />
    <label for="option_{key}">
      {key} - {name}

      {#if key == $defaultLanguage}
        <small class="text-base">(Current default)</small>
      {:else if $selectedLanguages.includes(key)}
        <button class="text-base" on:click|preventDefault|stopPropagation={() => $defaultLanguage = key}><small>Set as default</small></button>
      {/if}
    </label>
  </div>
{/each}

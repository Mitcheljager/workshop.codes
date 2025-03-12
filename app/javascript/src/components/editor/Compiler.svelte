<script>
  import { fly } from "svelte/transition"
  import { compile } from "@utils/compiler/compile"
  import { copyValueToClipboard } from "@src/copy"
  import { selectedLanguages, translationKeys } from "@src/stores/translationKeys"
  import { outsideClick } from "@components/actions/outsideClick"
  import { escapeable } from "@components/actions/escapeable"
  import { languageOptions } from "@src/lib/languageOptions"

  export let inline = false

  let compiling = false
  let copied = false
  let dropdownActive = false

  function doCompile(singleLanguageOverride = null) {
    compiling = true
    dropdownActive = false

    try {
      const compiled = compile(null, singleLanguageOverride)

      setTimeout(() => {
        compiling = false
        copyToClipboard(compiled)
      }, 150)
    } catch (error) {
      console.error(error)
      alert(error)
      compiling = false
    }
  }

  function copyToClipboard(value) {
    copied = true

    copyValueToClipboard(value)

    setTimeout(() => copied = false, 1000)
  }

  function keydown(event) {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyS") {
      event.preventDefault()
      doCompile()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<button
  class="tooltip {$$restProps["class"] ?? ""} {!inline ? "button button--secondary button--square" : ""}"
  on:click={() => doCompile()}>
  {#if inline && copied}
    Compiled and copied!
  {:else}
    {#if compiling}
      Compiling...
    {:else}
      Compile
    {/if}
  {/if}

  {#if copied && !inline}
    <div transition:fly={{ y: 5, duration: 150 }} class="tooltip__content bg-primary text-white block">
      Copied to clipboard
    </div>
  {/if}
</button>

{#if $selectedLanguages.length && Object.keys($translationKeys).length}
  <div class:dropdown={!inline} use:outsideClick on:outsideClick={() => dropdownActive = false}>
    {#if inline}
      <hr />
    {:else}
      <button aria-label="Backups" class="button button--square button--secondary pr-0 pl-0 h-100 flex align-center" on:click={() => dropdownActive = !dropdownActive}>
        <svg width="18px" height="18px" viewBox="0 0 24 24" class="m-0">
          <path d="M7.00003 8.5C6.59557 8.5 6.23093 8.74364 6.07615 9.11732C5.92137 9.49099 6.00692 9.92111 6.29292 10.2071L11.2929 15.2071C11.6834 15.5976 12.3166 15.5976 12.7071 15.2071L17.7071 10.2071C17.9931 9.92111 18.0787 9.49099 17.9239 9.11732C17.7691 8.74364 17.4045 8.5 17 8.5H7.00003Z" fill="white" />
        </svg>
      </button>
    {/if}

    {#if dropdownActive || inline}
      <div transition:fly={{ duration: 150, y: 20 }} use:escapeable on:escape={() => dropdownActive = false} class:dropdown__content={!inline} class="block w-100" style="width: 200px">
        <p class="pl-1/4 pr-1/4 mt-1/8 mb-1/8" class:text-small={inline}>Compile for a single language only</p>
        <p class="pl-1/4 pr-1/4 mt-0 text-small text-dark">Compile translations as standard Custom Strings for the given language.</p>

        {#each $selectedLanguages as language}
          <button class="dropdown__item" on:click={() => doCompile(language)}>{languageOptions[language].name}</button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

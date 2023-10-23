<script>
  import { fly } from "svelte/transition"
  import { currentProject, isSignedIn, isMobile, currentProjectUUID, modal } from "../../stores/editor"
  import { Modal } from "../../constants/Modal"
  import { outsideClick } from "../actions/outsideClick"
  import Compiler from "./Compiler.svelte"
  import Settings from "./Settings.svelte"
  import Shortcuts from "./Shortcuts.svelte"
  import Save from "./Save.svelte"
  import ThreeDotMenu from "../icon/ThreeDotMenu.svelte"

  let mobileDropdown
  let showMobileDropdown = false

  $: if (!$isMobile) showMobileDropdown = false
</script>

<div class="editor__actions" transition:fly={{ y: -10, duration: 200 }}>
  {#if $currentProjectUUID && !$currentProject?.is_owner}
    <div class="warning warning--orange br-1 align-self-center">
      You do not own this project and can not save
    </div>
  {/if}

  {#if !$isMobile}
    <Shortcuts />
  {/if}

  <Settings />

  {#if !$isMobile}
    <button class="button button--secondary button--square" on:click={() => modal.show(Modal.TranslationKeys)}>
      Translations
    </button>
  {/if}

  {#if $isSignedIn && $currentProject?.is_owner}
    {#if !$isMobile}
      <button class="button button--secondary button--square" on:click={() => modal.show(Modal.ScriptImporter)}>
        Import Script
      </button>
    {/if}
  {/if}

  {#if !$isMobile}
    <Compiler />
  {/if}

  {#if $isMobile}
    <div class="dropdown settings" bind:this={mobileDropdown} use:outsideClick on:outsideClick={() => showMobileDropdown = false}>
      <button
        class="button button--secondary button--square"
        on:click|stopPropagation={() => showMobileDropdown = !showMobileDropdown}
      >
        <ThreeDotMenu />
      </button>

      {#if showMobileDropdown}
        <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--right block w-100" style="width: 200px">
          <button class="dropdown__item" on:click={() => modal.show(Modal.TranslationKeys)}>
            Translations
          </button>

          {#if $isSignedIn && $currentProject?.is_owner}
            <button class="dropdown__item" on:click={() => modal.show(Modal.ScriptImporter)}>
              Import Script
            </button>
          {/if}

          <Compiler class="dropdown__item" inline={true} />
        </div>
      {/if}
    </div>
  {/if}

  {#if $isSignedIn && $currentProject?.is_owner}
    <Save />
  {/if}
</div>

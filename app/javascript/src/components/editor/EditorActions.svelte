<script>
  import { fly } from "svelte/transition"
  import { currentProject, isSignedIn, isMobile, currentProjectUUID, modal } from "@stores/editor"
  import { Modal } from "@constants/Modal"
  import { outsideClick } from "@components/actions/outsideClick"
  import Compiler from "@components/editor/Compiler.svelte"
  import Settings from "@components/editor/Settings.svelte"
  import Shortcuts from "@components/editor/Shortcuts.svelte"
  import Save from "@components/editor/Save.svelte"
  import ThreeDotMenu from "@components/icon/ThreeDotMenu.svelte"

  let mobileDropdown
  let showMobileDropdown = false

  $: if (!$isMobile) showMobileDropdown = false
</script>

<div class="editor__actions" transition:fly={{ y: -10, duration: 200 }}>
  {#if $currentProjectUUID && !$currentProject?.is_owner && !$isMobile}
    <div class="warning warning--orange ml-1/8 br-1 align-self-center">
      You do not own this project and can not save
    </div>
  {/if}

  {#if !$isMobile}
    <Shortcuts />
  {/if}

  <Settings />

  {#if !$isMobile}
    <div class="button-group">
      <button class="button button--secondary button--square" on:click={() => modal.show(Modal.Enhance)}>
        Enhance
      </button>

      <button class="button button--secondary button--square" on:click={() => modal.show(Modal.TranslationKeys)}>
        Translations
      </button>

      {#if $currentProject?.is_owner}
        <button class="button button--secondary button--square" on:click={() => modal.show(Modal.ScriptImporter)}>
          Import Script
        </button>
      {/if}

      <Compiler />
    </div>
  {:else}
    <div class="dropdown settings" bind:this={mobileDropdown} use:outsideClick on:outsideClick={() => showMobileDropdown = false}>
      <button
        class="button button--secondary button--square"
        on:click|stopPropagation={() => showMobileDropdown = !showMobileDropdown}>
        <ThreeDotMenu />
      </button>

      {#if showMobileDropdown}
        <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--right block w-100" style="width: 200px">
          <button class="dropdown__item" on:click={() => modal.show(Modal.Enhance)}>
            Enhance
          </button>

          <button class="dropdown__item" on:click={() => modal.show(Modal.TranslationKeys)}>
            Translations
          </button>

          {#if $currentProject?.is_owner}
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

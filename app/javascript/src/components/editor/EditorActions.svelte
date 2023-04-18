<script>
  import { currentProject, isSignedIn, isMobile } from "../../stores/editor"
  import ScriptImporter from "./ScriptImporter.svelte"
  import TranslationKeys from "./TranslationKeys/TranslationKeys.svelte"
  import Compiler from "./Compiler.svelte"
  import Settings from "./Settings.svelte"
  import Shortcuts from "./Shortcuts.svelte"
  import Save from "./Save.svelte"

  let active = false
</script>

<div class="editor__actions">
  {#if !$currentProject?.is_owner}
    <div class="warning warning--orange br-1 align-self-center">
      You do not own this project and can not save
    </div>
  {/if}

  <div class:dropdown={$isMobile}>
    {#if $isMobile}
      <button class="empty-button" on:click={() => active = !active}>
        ⠇
      </button>
    {/if}

    {#if !$isMobile || active}
      <div class={$isMobile ? "dropdown__content editor__mobile-actions" : "" }>
        {#if !$isMobile}
          <Shortcuts />
          <Settings />
        {/if}

        <TranslationKeys />

        {#if isSignedIn && $currentProject?.is_owner}
          <ScriptImporter />
        {/if}

        <Compiler />
      </div>
    {/if}
  </div>

  {#if isSignedIn && $currentProject?.is_owner}
    <Save />
  {/if}
</div>

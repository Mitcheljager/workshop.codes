<script>
  import { fly } from "svelte/transition"
  import { currentProject, isSignedIn, isMobile, currentProjectUUID } from "../../stores/editor"
  import ScriptImporter from "./ScriptImporter.svelte"
  import TranslationKeys from "./TranslationKeys/TranslationKeys.svelte"
  import Compiler from "./Compiler.svelte"
  import Settings from "./Settings.svelte"
  import Shortcuts from "./Shortcuts.svelte"
  import Save from "./Save.svelte"
</script>

<div class="editor__actions" transition:fly={{ y: -10, duration: 200 }}>
  {#if $currentProjectUUID && !$currentProject?.is_owner}
    <div class="warning warning--orange br-1 align-self-center">
      You do not own this project and can not save
    </div>
  {/if}

  {#if !$isMobile}
    <Shortcuts />
    <Settings />
    <TranslationKeys />

    {#if $isSignedIn && $currentProject?.is_owner}
      <ScriptImporter />
    {/if}

    <Compiler />
  {/if}

  {#if $isSignedIn && $currentProject?.is_owner}
    <Save />
  {/if}
</div>

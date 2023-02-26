<script>
  import { onMount } from "svelte"
  import { currentItem, currentProject, currentProjectUUID, items, sortedItems, projects, isSignedIn, completionsMap } from "../../stores/editor"
  import EditorAside from "./EditorAside.svelte"
  import EditorWiki from "./EditorWiki.svelte"
  import CodeMirror from "./CodeMirror.svelte"
  import DragHandle from "./DragHandle.svelte"
  import ScriptImporter from "./ScriptImporter.svelte"
  import TranslationKeys from "./TranslationKeys/TranslationKeys.svelte"
  import Compiler from "./Compiler.svelte"
  import ProjectsDropdown from "./ProjectsDropdown.svelte"
  import Save from "./Save.svelte"
  import Empty from "./Empty.svelte"
  import Settings from "./Settings.svelte"
  import Shortcuts from "./Shortcuts.svelte"
  import ItemFinder from "./ItemFinder.svelte"
  import FindReplaceAll from "./FindReplaceAll.svelte"
  import * as logo from "../../../../assets/images/logo.svg"

  export let values
  export let actions
  export let constants
  export let defaults
  export let heroes
  export let maps
  export let _projects
  export let _isSignedIn = false

  let fetchArticle

  $: if ($currentProject && $sortedItems?.length && $currentItem && !Object.keys($currentItem).length)
    $currentItem = $sortedItems.filter(i => i.type == "item")?.[0] || {}

  onMount(() => {
    $completionsMap = parseKeywords()
    $currentItem = $items?.[0] || {}
    $projects = _projects || []
    $isSignedIn = _isSignedIn
  })

  function parseKeywords() {
    const mappedValues = objectToKeyword(values, "text")
    const mappedActions = objectToKeyword(actions, "function")
    const mappedConstants = objectToKeyword(constants.map(c => Object.values(c)).flat(1), "constant")
    const mappedHeroes = objectToKeyword(heroes, "text")
    const mappedMaps = objectToKeyword(maps, "text")

    return [...mappedValues, ...mappedActions, ...mappedConstants, ...mappedHeroes, ...mappedMaps]
  }

  function objectToKeyword(obj, keywordType) {
    return Object.values(obj).map(v => {
      const params = {
        label: v["en-US"] || v["en"],
        type: keywordType,
        info: v.description,
        args_length: v.args?.length || 0
      }

      if (v.args_unlimited) params.args_unlimited = true
      if (v.args_allow_null) params.args_allow_null = true

      // Exclude all trailing "null" defaults
      if (v.args?.some(a => a.default?.toString().toLowerCase() == "null")) {
        let nullCount = 0
        for (let i = 0; i < v.args.length; i++) {
          if (v.args[v.args.length - 1 - i].default.toLowerCase() == "null") {
            nullCount++
          } else break
        }

        if (nullCount) params.args_min_length = v.args.length - nullCount
      }

      if (v.args?.length) {
        // Add detail arguments in autocomplete results
        const detail = v.args.map(a => `${ toCapitalize(a.name) }`).join(", ")

        params.detail_full = detail
        params.detail = `(${ detail.slice(0, 30) }${ detail.length > 30 ? "..." : "" })`

        // Add apply values when selecting autocomplete, filling in default args
        const lowercaseDefaults = Object.keys(defaults).map(k => k.toLowerCase())
        const apply = v.args.map(a => {
          const string = a.default?.toString().toLowerCase().replaceAll(",", "")

          if (lowercaseDefaults.includes(string)) return defaults[toCapitalize(string)]

          return toCapitalize(string)
        })

        params.apply = `${ v["en-US"] }(${ apply.join(", ") })`

        // Add arguments to info box
        params.info += "\n\nArguments: "
        params.info += detail
      }

      return params
    })

    function toCapitalize(string) {
      return string.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
    }
  }

  // Updates the tab title
  $: document.title = $currentProject?.title !== undefined ? `Editor | ${ $currentProject.title } | Workshop.codes Script Editor` : "Workshop.codes Script Editor | Workshop.codes"
</script>

<div class="editor">
  <div class="editor__top">
    <img on:click={() => $currentProjectUUID = null} class="mr-1/2 cursor-pointer" src={logo} height=50 alt="Workshop.codes" />

    {#if $projects}
      <ProjectsDropdown />
    {/if}

    <div class="editor__actions">
      {#if $currentProjectUUID}
        {#if !$currentProject?.is_owner}
          <div class="warning warning--orange br-1 align-self-center">
            You do not own this project and can not save
          </div>
        {/if}

        <Shortcuts />

        <Settings />

        <TranslationKeys />

        {#if isSignedIn && $currentProject?.is_owner}
          <ScriptImporter />
        {/if}

        <Compiler />

        {#if isSignedIn && $currentProject?.is_owner}
          <Save />
        {/if}
      {/if}
    </div>
  </div>

  {#if $currentProjectUUID}
    <div class="editor__aside">
      <div class="editor__scrollable">
        <div class="pr-1/4 pl-1/4">
          <ItemFinder />

          <div class="mt-1/16">
            <FindReplaceAll />
          </div>
        </div>

        <hr class="mt-1/4 mb-1/4" />

        <EditorAside />
      </div>

      <DragHandle key="sidebar-width" currentSize=300 />
    </div>

    <div class="editor__content">
      {#if Object.keys($currentItem).length}
        <CodeMirror on:search={({ detail }) => fetchArticle(`wiki/search/${ detail }`, true)} />
      {/if}
    </div>

    <div class="editor__popout editor__scrollable">
      <EditorWiki bind:fetchArticle />

      <DragHandle key="popout-width" currentSize=300 align="left" />
    </div>
  {:else}
    <Empty />
  {/if}

  <div class="editor__mobile-warning">
    The editor is currently not functional on mobile
  </div>
</div>

{#if !$isSignedIn}
  <div class="alerts">
    <div class="alerts__alert alerts__alert--warning">
      You are not signed in and nothing you do will be saved!
      <a href="/login">Please sign in</a>
    </div>
  </div>
{/if}

<script>
  import { onMount } from "svelte"
  import { fly } from "svelte/transition"
  import { currentItem, currentProject, currentProjectUUID, items, sortedItems, projects, isSignedIn, completionsMap, workshopConstants, isMobile, screenWidth } from "../../stores/editor"
  import EditorActions from "./EditorActions.svelte"
  import EditorAside from "./EditorAside.svelte"
  import EditorWiki from "./EditorWiki.svelte"
  import CodeMirror from "./CodeMirror.svelte"
  import DragHandle from "./DragHandle.svelte"
  import ProjectsDropdown from "./ProjectsDropdown.svelte"
  import Empty from "./Empty.svelte"
  import ItemFinder from "./ItemFinder.svelte"
  import FindReplaceAll from "./FindReplaceAll.svelte"
  import LineFinder from "./LineFinder.svelte"
  import Modals from "./Modals/Modals.svelte"
  import Logo from "../icon/Logo.svelte"

  export let events
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
    $workshopConstants = constants
    $currentItem = $items?.[0] || {}
    $projects = _projects || []
    $isSignedIn = _isSignedIn
  })

  function parseKeywords() {
    const mappedEvents = objectToKeyword(events, "event")
    const mappedValues = objectToKeyword(values, "text")
    const mappedActions = objectToKeyword(actions, "function")
    const mappedConstants = objectToKeyword(Object.values(constants).map(c => Object.values(c)).flat(1), "constant")
    const mappedHeroes = objectToKeyword(heroes, "text")
    const mappedMaps = objectToKeyword(maps, "text")

    return [...mappedEvents, ...mappedValues, ...mappedActions, ...mappedConstants, ...mappedHeroes, ...mappedMaps]
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

<svelte:window bind:innerWidth={$screenWidth} />

<div class="editor" class:editor--empty={!$currentProjectUUID}>
  <div class="editor__top">
    <button class="empty-button w-auto {$isMobile ? 'mr-1/4' : 'mr-1/2'}" on:click={() => $currentProjectUUID = null}>
      <Logo />
    </button>

    {#if $projects}
      <ProjectsDropdown />
    {/if}

    {#if $currentProjectUUID}
      <EditorActions />
    {/if}
  </div>

  {#if $currentProjectUUID}
    <div class="editor__aside" in:fly={$isMobile ? { y: -10, duration: 200 } : { x: -10, duration: 200 }}>
      <div class="editor__scrollable">
        <div class="pr-1/4 pl-1/4">
          <ItemFinder />

          <div class="mt-1/16">
            <LineFinder />
          </div>

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
      {#if $currentItem?.id}
        <CodeMirror on:search={({ detail }) => fetchArticle(`wiki/search/${ detail }`, true)} />
      {/if}
    </div>
  {:else}
    <Empty />
  {/if}

  <div class="editor__popout editor__scrollable" in:fly={$isMobile ? { y: 10, duration: 200 } : { x: 10, duration: 200 }}>
    <EditorWiki bind:fetchArticle />

    <DragHandle key="popout-width" currentSize=300 align="left" />
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

<Modals />

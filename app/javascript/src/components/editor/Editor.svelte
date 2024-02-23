<script>
  import { onMount } from "svelte"
  import { fly } from "svelte/transition"
  import { currentItem, currentProject, currentProjectUUID, recoveredProject, items, sortedItems, projects, isSignedIn, completionsMap, workshopConstants, isMobile, screenWidth, settings } from "../../stores/editor"
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
  import ProjectRecovery from "./ProjectRecovery.svelte"
  import Logo from "../icon/Logo.svelte"
  import Bugsnag from "../Bugsnag.svelte"

  export let events
  export let values
  export let actions
  export let constants
  export let defaults
  export let heroes
  export let maps
  export let bugsnagApiKey = ""
  export let _projects
  export let _isSignedIn = false

  let fetchArticle

  $: if ($currentProject && $sortedItems?.length && $currentItem && !Object.keys($currentItem).length)
    $currentItem = $sortedItems.filter(i => i.type == "item")?.[0] || {}

  $: $completionsMap = parseKeywords($settings)

  onMount(() => {
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

      if (!params.args_length) return params

      // Add detail arguments in autocomplete results
      const detail = v.args.map(a => `${ toCapitalize(a.name) }`)
      const joinedDetail = detail.join(", ")

      params.detail_full = joinedDetail
      params.detail = `(${ joinedDetail.slice(0, 30) }${ joinedDetail.length > 30 ? "..." : "" })`

      // Add apply values when selecting autocomplete, filling in default args
      const lowercaseDefaults = Object.keys(defaults).map(k => k.toLowerCase())
      const useParameterObject = $settings["autocomplete-parameter-objects"] && params.args_length >= $settings["autocomplete-min-parameter-size"]
      const useNewlines = params.args_length >= $settings["autocomplete-min-parameter-newlines"]

      const apply = v.args.map(a => {
        const name = toCapitalize(a.name?.toString().toLowerCase())
        let defaultValue = a.default?.toString().toLowerCase().replaceAll(",", "")
        
        if (lowercaseDefaults.includes(defaultValue.toLowerCase())) defaultValue = defaults[toCapitalize(defaultValue)]
        else defaultValue = toCapitalize(defaultValue)
        
        const notVector = name !== "X" && name !== "Y" && name !== "Z"
        if (useParameterObject && notVector) return `${ useNewlines ? "\n\t" : "" } ${ name }: ${ defaultValue }`
        
        return defaultValue
      })

      params.parameter_keys = detail
      params.parameter_defaults = apply
      const notVector = detail[0] !== "X" && detail[1] !== "Y" && detail[2] !== "Z"
      
      params.apply = (useParameterObject && notVector) ?
        useNewlines ?
          `${ v["en-US"] }({ ${ apply.join(",") }\n})` :
          `${ v["en-US"] }({ ${ apply.join(", ") } })` :
        `${ v["en-US"] }(${ apply.join(", ") })`

      // Add arguments to info box
      params.info += "\n\nArguments: "
      params.info += detail

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
    <button class="w-auto {$isMobile ? 'mr-1/4' : 'mr-1/2'}" on:click={() => $currentProjectUUID = null}>
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
        <!-- This key makes it so CodeMirror has to re-render when the "word-wrap" setting is changed.
        There could be more elegant solutions that use the CodeMirror API to update extensions,
        but this is the far more simple and readable solution. -->
        {#key $settings["word-wrap"]}
          <CodeMirror on:search={({ detail }) => fetchArticle(`wiki/search/${ detail }`, true)} />
        {/key}
      {/if}

      {#if !$items?.length}
        <em class="block p-1/4 text-dark">Your project is empty. Start by creating a new item in the sidebar.</em>
      {/if}
    </div>
  {:else}
    <Empty />
  {/if}

  <div class="editor__popout editor__scrollable" in:fly={$isMobile ? { y: 10, duration: 200 } : { x: 10, duration: 200 }}>
    <EditorWiki bind:fetchArticle />

    <DragHandle key="popout-width" currentSize=300 align="left" />
  </div>

  {#if $recoveredProject}
    <ProjectRecovery />
  {/if}
</div>

{#if !$isSignedIn}
  <div class="alerts">
    <div class="alert alert--warning">
      You are not signed in and nothing you do will be saved!
      <a href="/login">Please sign in</a>
    </div>
  </div>
{/if}

<Modals />

{#if bugsnagApiKey}
  <Bugsnag apiKey={bugsnagApiKey} />
{/if}

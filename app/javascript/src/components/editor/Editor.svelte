<script>
  import { onMount } from "svelte"
  import { currentItem, currentProject, items, sortedItems, projects, isSignedIn, completionsMap } from "../../stores/editor"
  import EditorAside from "./EditorAside.svelte"
  import EditorWiki from "./EditorWiki.svelte"
  import CodeMirror from "./CodeMirror.svelte"
  import DragHandle from "./DragHandle.svelte"
  import ScriptImporter from "./ScriptImporter.svelte"
  import Compiler from "./Compiler.svelte"
  import ProjectsDropdown from "./ProjectsDropdown.svelte"
  import Save from "./Save.svelte"
  import Empty from "./Empty.svelte"
  import * as logo from "../../../../assets/images/logo.svg"

  export let values
  export let actions
  export let defaults
  export let _projects
  export let _isSignedIn = false

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

    return [...mappedValues, ...mappedActions]
  }

  function objectToKeyword(obj, keywordType) {
    return Object.values(obj).map(v => {
      const params = {
        label: v["en-US"],
        type: keywordType,
        info: v.description,
        args_length: v.args?.length || 0
      }

      if (v.args?.length) {
        // Add detail arguments in autocomplete results
        let detail = v.args.map(a => {
          const type = typeof a.type
          if (type === "string") return a.type
          if (Array.isArray(a.type)) return a.type?.[0]
          if (type === "object") return Object.keys(a.type)?.[0]
        }).join(", ")

        detail = detail.replaceAll("unsigned", "")
        params.detail = `(${ detail.slice(0, 30) }${ detail.length > 30 ? "..." : "" })`

        // Add apply values when selecting autocomplete, filling in default args
        const lowercaseDefaults = Object.keys(defaults).map(k => k.toLowerCase())
        const apply = v.args.map(a => {
          const string = a.default?.toString().toLowerCase().replaceAll(",", "")

          if (lowercaseDefaults.includes(string)) return defaults[toCapitalize(string)]

          return toCapitalize(string)
        })

        params.apply = `${ v["en-US"] }(${ apply.join(", ") })`
      }

      return params
    })

    function toCapitalize(string) {
      return string.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
    }
  }
</script>

<svelte:head>
  {#if $currentProject}
    <title>Editor | {$currentProject.title} | Workshop.codes Script Editor</title>
  {:else}
  <title>Workshop.codes Script Editor | Workshop.codes</title>
  {/if}
</svelte:head>

<div class="editor">
  <div class="editor__top">
    <img on:click={() => $currentProject = null} class="mr-1/2 cursor-pointer" src={logo} height=50 alt="Workshop.codes" />

    {#if $projects}
      <ProjectsDropdown />
    {/if}

    <div class="ml-auto inline-flex gap-1/8">
      {#if $currentProject}
        {#if !$currentProject.is_owner}
          <div class="warning warning--orange br-1 align-self-center">
            You do not own this project and can not save
          </div>
        {/if}

        {#if isSignedIn && $currentProject.is_owner}
          <ScriptImporter />
        {/if}

        <Compiler />

        {#if isSignedIn && $currentProject.is_owner}
          <Save />
        {/if}
      {/if}
    </div>
  </div>

  {#if $currentProject}
    <div class="editor__aside">
      <div class="editor__scrollable">
        <EditorAside />
      </div>

      <DragHandle key="sidebar-width" currentSize=300 />
    </div>

    <div class="editor__content">
      {#if Object.keys($currentItem).length}
        <CodeMirror completionsMap={$completionsMap} />
      {/if}
    </div>

    <div class="editor__popout editor__scrollable">
      <EditorWiki />

      <DragHandle key="popout-width" currentSize=300 align="left" />
    </div>
  {:else}
    <Empty />
  {/if}
</div>

{#if !$isSignedIn}
  <div class="alerts">
    <div class="alerts__alert alerts__alert--warning">
      You are not signed in and nothing you do will be saved!
      <a href="/login">Please sign in</a>
    </div>
  </div>
{/if}

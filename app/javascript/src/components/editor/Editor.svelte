<script>
  import { onMount } from "svelte"
  import { currentItem, currentProject, items, projects } from "../../stores/editor"
  import EditorAside from "./EditorAside.svelte"
  import EditorWiki from "./EditorWiki.svelte"
  import CodeMirror from "./CodeMirror.svelte"
  import DragHandle from "./DragHandle.svelte"
  import ScriptImporter from "./ScriptImporter.svelte"
  import Decompiler from "./Compiler.svelte"
  import ProjectsDropdown from "./ProjectsDropdown.svelte"
  import Save from "./Save.svelte"
  import Empty from "./Empty.svelte"
  import * as logo from "../../../../assets/images/logo.svg"

  export let values
  export let actions
  export let defaults
  export let _projects

  let completionsMap = []

  onMount(() => {
    completionsMap = parseKeywords()
    $currentItem = $items[0] || {}
    $projects = _projects || []
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
        info: v.description
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
      <ScriptImporter />
      <Decompiler />
      <Save />
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
      <CodeMirror {completionsMap} />
    </div>

    <div class="editor__popout editor__scrollable">
      <EditorWiki />

      <DragHandle key="popout-width" currentSize=300 align="left" />
    </div>
  {:else}
    <Empty />
  {/if}
</div>

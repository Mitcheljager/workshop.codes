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
  export let _projects

  let completionsMap = []

  onMount(() => {
    completionsMap = parseKeywords()
    $currentItem = $items[0] || {}
    $projects = _projects || []
  })

  function parseKeywords() {
    const mappedValues = Object.values(values).map(v => {
      return { label: v["en-US"], type: "keyword", info: v.description }
    })

    const mappedActions = Object.values(actions).map(a => {
      return { label: a["en-US"], type: "function", info: a.description }
    })

    return [...mappedValues, ...mappedActions]
  }
</script>

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

<script>
  import { onMount } from "svelte"
  import { currentItem, items } from "../../stores/editor"
  import EditorAside from "./EditorAside.svelte"
  import EditorWiki from "./EditorWiki.svelte"
  import CodeMirror from "./CodeMirror.svelte"
  import DragHandle from "./DragHandle.svelte"
  import ScriptImporter from "./ScriptImporter.svelte"
  import Decompiler from "./Compiler.svelte"

  export let values
  export let actions

  let completionsMap = []

  $: console.log("items", $items)

  onMount(() => {
    completionsMap = parseKeywords()
    $currentItem = $items[0] || {}
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
    <div class="ml-auto">
      <ScriptImporter />
      <Decompiler />
    </div>
  </div>

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
</div>

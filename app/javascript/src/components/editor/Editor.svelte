<script>
  import { onMount } from "svelte"
  import EditorAside from "./EditorAside.svelte"
  import EditorWiki from "./EditorWiki.svelte"
  import CodeMirror from "./CodeMirror.svelte"
  import DragHandle from "./DragHandle.svelte"
  import { currentItem, items } from "../../stores/editor.js"

  export let values
  export let actions

  let completionsMap = []

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

  </div>

  <div class="editor__aside">
    <EditorAside />

    <DragHandle key="sidebar-width" currentSize=300 />
  </div>

  <div class="editor__content">
    <CodeMirror content={$currentItem?.content || ""} {completionsMap} />
  </div>

  <div class="editor__popout">
    <EditorWiki />

    <DragHandle key="popout-width" currentSize=300 align="left" />
  </div>
</div>

<script>
  import { onMount } from "svelte"
  import { basicSetup } from "codemirror"
  import { EditorView, keymap } from "@codemirror/view"
  import { EditorState, EditorSelection } from "@codemirror/state"
  import { indentWithTab } from "@codemirror/commands"
  import { indentUnit } from "@codemirror/language"
  import { autocompletion } from "@codemirror/autocomplete"
  import { OverwatchWorkshop } from "../../lib/customLanguage"
  import { currentItem, editorStates, items } from "../../stores/editor"
  import debounce from "../../debounce"

  export let completionsMap = []

  let element
  let view
  let currentId

  $: if ($currentItem.id && view) updateEditorState()

  onMount(() => {
    view = new EditorView({
      parent: element
    })
  })

  function updateEditorState() {
    if (currentId) $editorStates[currentId] = view.state

    currentId = $currentItem.id

    if ($editorStates[currentId]) {
      view.setState($editorStates[currentId])
      return
    }

    $editorStates[currentId] = createEditorState($currentItem.content)
    view.setState($editorStates[currentId])
  }

  function createEditorState(content) {
    return EditorState.create({
      doc: content,
      extensions: [
        OverwatchWorkshop(),
        autocompletion({
          activateOnTyping: true,
          override: [completions],
          closeOnBlur: false
        }),
        indentUnit.of("    "),
        keymap.of([
          { key: "Tab", run: tabAutocomplete },
          { key: "Enter", run: autoIndent },
          indentWithTab,
        ]),
        EditorView.updateListener.of((state) => {
          if (state.docChanged) updateItem()
        }),
        basicSetup
      ]
    })
  }

  function completions(context) {
    const word = context.matchBefore(/\w*/)

    if (word.from == word.to && !context.explicit) return null

    return {
      from: word.from,
      options: completionsMap
    }
  }

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 50) {
      event.preventDefault()
      view.focus()
    }
  }

  function autoIndent({ state, dispatch }) {
    const changes = state.changeByRange(range => {
      const { from, to } = range, line = state.doc.lineAt(from)

      const spaces = /^\s*/.exec(state.doc.lineAt(from).text)?.[0].length
      const tabs = /^\t*/.exec(state.doc.lineAt(from).text)?.[0].length
      let indent = Math.floor(spaces / 4) + tabs
      let insert = "\n"
      for (let i = 0; i < indent; i++) { insert += "\t" }

      const openBracket = /[\{\(\[]/gm.exec(state.doc.lineAt(from).text)?.[0].length
      const closeBracket = /[\}\)\]]/gm.exec(state.doc.lineAt(from).text)?.[0].length
      if (openBracket && !closeBracket) insert += "\t"

      return { changes: { from, to, insert }, range: EditorSelection.cursor(from + insert.length) }
    })

    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }))
    return true
  }

  function tabAutocomplete() {
    return !!element.querySelector(".cm-tooltip-autocomplete")
  }

  const updateItem = debounce(() => {
    $currentItem.content = view.state.doc.toString()
    const index = $items.indexOf(i => i.id == $currentItem.id)
    $items[index] = $currentItem
  }, 500)
</script>

<svelte:window on:keydown={keydown} />

<div bind:this={element} ></div>

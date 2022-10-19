<script>
  import { onMount } from "svelte"
  import { basicSetup } from "codemirror"
  import { EditorView, keymap } from "@codemirror/view"
  import { EditorState, EditorSelection } from "@codemirror/state"
  import { indentUnit, StreamLanguage, syntaxHighlighting } from "@codemirror/language"
  import { autocompletion } from "@codemirror/autocomplete"
  import { linter, lintGutter } from "@codemirror/lint"
  import { OWLanguage, highlightStyle } from "../../lib/OWLanguageLegacy"
  import { OWLanguageLinter } from "../../lib/OWLanguageLinter"
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
        syntaxHighlighting(highlightStyle),
        StreamLanguage.define(OWLanguage),
        autocompletion({
          activateOnTyping: true,
          override: [completions],
          closeOnBlur: false,
          hintOptions: /[()\[\]{};:>,]/
        }),
        lintGutter(),
        linter(OWLanguageLinter),
        indentUnit.of("    "),
        keymap.of([
          { key: "Tab", run: tabIndent },
          { key: "Enter", run: autoIndentOnEnter }
        ]),
        EditorView.updateListener.of((state) => {
          if (state.docChanged) updateItem()
        }),
        basicSetup
      ]
    })
  }

  function completions(context) {
    const word = context.matchBefore(/[a-zA-Z0-9 ]*/)

    if (word.from == word.to && !context.explicit) return null

    return {
      from: word.from,
      to: word.to,
      options: completionsMap,
      validFor: /^(?:[a-zA-Z0-9]+)$/i
    }
  }

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 50) {
      event.preventDefault()
      view.focus()
    }
  }

  function autoIndentOnEnter({ state, dispatch }) {
    const changes = state.changeByRange(range => {
      const { from, to } = range, line = state.doc.lineAt(from)

      const indent = getsIntendForLine(state, from)
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

  function tabIndent({ state, dispatch }) {
    if (element.querySelector(".cm-tooltip-autocomplete")) return true

    const changes = state.changeByRange(range => {
      const { from, to } = range, line = state.doc.lineAt(from)

      const previousIndent = getsIntendForLine(state, from - 1)
      const currentIndent = getsIntendForLine(state, from)
      let insert = "\t"

      if (currentIndent < previousIndent) {
        for (let i = 0; i < previousIndent - 1; i++) { insert += "\t" }
      }

      return { changes: { from, to, insert }, range: EditorSelection.cursor(from + insert.length) }
    })

    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }))
    return true
  }

  function getsIntendForLine(state, line) {
    const spaces = /^\s*/.exec(state.doc.lineAt(line).text)?.[0].length
    const tabs = /^\t*/.exec(state.doc.lineAt(line).text)?.[0].length
    return Math.floor(spaces / 4) + tabs
  }

  const updateItem = debounce(() => {
    $currentItem.content = view.state.doc.toString()
    const index = $items.indexOf(i => i.id == $currentItem.id)
    $items[index] = $currentItem
  }, 500)
</script>

<svelte:window on:keydown={keydown} />

<div bind:this={element} ></div>

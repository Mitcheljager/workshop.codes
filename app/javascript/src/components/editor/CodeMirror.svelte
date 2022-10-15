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
          indentWithTab,
          { key: "Enter", run: ({ state, dispatch }) => {
            let changes = state.changeByRange(range => {
              let { from, to } = range, line = state.doc.lineAt(from)
              let indent = /^\s*/.exec(state.doc.lineAt(from).text)[0].length
              let insert = "\n"
              for (let i = 0; i < indent; i++) { insert += "\t" }
              return { changes: { from, to, insert }, range: EditorSelection.cursor(from + insert.length) }
            })

            dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }))
            return true
          }}
        ]),
        EditorView.updateListener.of((state) => {
          if (state.docChanged) updateItem()
        }),
        basicSetup,
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

  const updateItem = debounce(() => {
    $currentItem.content = view.state.doc.toString()
    const index = $items.indexOf(i => i.id == $currentItem.id)
    $items[index] = $currentItem
  }, 500)
</script>

<svelte:window on:keydown={keydown} />

<div bind:this={element} ></div>

<script>
  import { onMount } from "svelte"
  import { basicSetup } from "codemirror"
  import { EditorView, keymap } from "@codemirror/view"
  import { indentWithTab } from "@codemirror/commands"
  import { autocompletion } from "@codemirror/autocomplete"
  import { OverwatchWorkshop } from "../../lib/customLanguage"

  export let content
  export let completionsMap = []

  let element
  let view

  $: if (content && view) updateContent()

  onMount(() => {
    view = new EditorView({
      doc: content,
      parent: element,
      extensions: [
        basicSetup,
        OverwatchWorkshop(),
        autocompletion({
          activateOnTyping: true,
          override: [completions],
          closeOnBlur: false,
        }),
        keymap.of([
          indentWithTab,
        ])
      ]
    })
  })

  function completions(context) {
    let word = context.matchBefore(/\w*/)

    if (word.from == word.to && !context.explicit) return null

    return {
      from: word.from,
      options: completionsMap
    }
  }

  function updateContent() {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content }
    })
  }

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 50) {
      event.preventDefault()
      view.focus()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<div bind:this={element} ></div>

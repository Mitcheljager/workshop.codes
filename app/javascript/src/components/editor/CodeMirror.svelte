<script>
  import { onDestroy, onMount, createEventDispatcher, tick } from "svelte"
  import { basicSetup } from "codemirror"
  import { EditorView, keymap } from "@codemirror/view"
  import { EditorState, EditorSelection, Transaction } from "@codemirror/state"
  import { indentUnit, StreamLanguage, syntaxHighlighting } from "@codemirror/language"
  import { autocompletion, pickedCompletion } from "@codemirror/autocomplete"
  import { redo } from "@codemirror/commands"
  import { linter, lintGutter } from "@codemirror/lint"
  import { indentationMarkers } from "@replit/codemirror-indentation-markers"
  import { OWLanguage, highlightStyle } from "../../lib/OWLanguageLegacy"
  import { OWLanguageLinter } from "../../lib/OWLanguageLinter"
  import { parameterTooltip } from "../../lib/parameterTooltip"
  import { extraCompletions } from "../../lib/extraCompletions"
  import { foldBrackets } from "../../lib/foldBrackets"
  import { currentItem, editorStates, editorScrollPositions, items, currentProjectUUID, completionsMap, variablesMap, subroutinesMap, mixinsMap, settings } from "../../stores/editor"
  import { translationsMap } from "../../stores/translationKeys"
  import { getPhraseFromPosition } from "../../utils/parse"
  import { tabIndent, getIndentForLine, getIndentCountForText, shouldNextLineBeIndent, autoIndentOnEnter, indentMultilineInserts } from "../../utils/codemirror/indent"
  import debounce from "../../debounce"

  const dispatch = createEventDispatcher()
  const updateItem = debounce(() => {
    $currentItem = {
      ...$currentItem,
      content: view.state.doc.toString()
    }

    const index = $items.findIndex(i => i.id == $currentItem.id)
    if (index !== -1) $items[index] = $currentItem
  }, 250)

  let element
  let view
  let currentId
  let updatingState = false

  $: if ($currentProjectUUID) $editorStates = {}
  $: if ($currentItem.id != currentId && view) updateEditorState()
  $: if ($currentItem.forceUpdate) updateEditorState()

  onMount(() => {
    view = new EditorView({
      parent: element
    })
  })

  onDestroy(() => $editorStates = {})

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
          hintOptions: /[()\[\]{};:>,+-=]/
        }),
        lintGutter(),
        linter(OWLanguageLinter),
        indentUnit.of("    "),
        keymap.of([
          { key: "Tab", run: tabIndent },
          { key: "Shift-Tab", run: tabIndent },
          { key: "Enter", run: autoIndentOnEnter },
          { key: "Ctrl-Shift-z", run: redoAction }
        ]),
        EditorView.updateListener.of((transaction) => {
          if (transaction.docChanged) {
            indentMultilineInserts(view, transaction)
            updateItem()
          }
          if (transaction.selectionSet) $editorStates[currentId].selection = view.state.selection
        }),
        basicSetup,
        parameterTooltip(),
        indentationMarkers(),
        rememberScrollPosition(),
        foldBrackets(),
        ...($settings["word-wrap"] ? [EditorView.lineWrapping] : [])
      ]
    })
  }

  function updateEditorState() {
    updatingState = true

    if (currentId && !$currentItem.forceUpdate) $editorStates[currentId] = view.state
    if ($currentItem.forceUpdate) $currentItem = { ...$currentItem, forceUpdate: false }

    currentId = $currentItem.id

    if ($editorStates[currentId]) {
      onStateUpdateEnd()
      return
    }

    // Remove keys not present. Used when deleting items or when switching projects
    Object.keys($editorStates).forEach(key => {
      if (!$items.some(i => i.id == key)) delete $editorStates[key]
    })

    $editorStates[currentId] = createEditorState($currentItem.content)

    onStateUpdateEnd()
  }

  /**
   * This is fired after updateEditorState, after all required bits are set.
   * Part of this is wrapped in an empty setTimeout to wait for the view state to update.
   */
  function onStateUpdateEnd() {
    view.setState($editorStates[currentId])

    requestAnimationFrame(() => {
      updatingState = false
      setScrollPosition(view, currentId)
    })
  }

  /**
   * Returns a plugin that updates a store of scroll positions when the view is scrolled.
   * The view is also scrolled when updating the view, but we don't want to store that position.
   * For this we use the updatingState flag to determine if it was a user scroll or a update scroll.
   */
  function rememberScrollPosition() {
    return EditorView.domEventHandlers({
      scroll(_, view) {
        if (updatingState) return

        $editorScrollPositions = {
          ...$editorScrollPositions,
          [currentId]: view.scrollDOM.scrollTop
        }
      }
    })
  }

  function setScrollPosition(view, id) {
    view.scrollDOM.scrollTo({ top: $editorScrollPositions[id] || 0 })
  }

  function completions(context) {
    const word = context.matchBefore(/[@a-zA-Z0-9_ ]*/)

    const add = word.text.search(/\S|$/)
    if (word.from + add == word.to && !context.explicit) return null

    // There's probably a better way of doing this
    let specialOverwrite = null
    if (word.text.includes("@i")) {
      specialOverwrite = $mixinsMap
    } else if (word.text.includes("@t")) {
      specialOverwrite = $translationsMap
    }

    return {
      from: word.from + add,
      to: word.to,
      options: specialOverwrite || [...$completionsMap, ...$variablesMap, ...$subroutinesMap, ...extraCompletions],
      validFor: /^(?:[a-zA-Z0-9]+)$/i
    }
  }

  function click(event) {
    if (!event.altKey) return

    event.preventDefault()
    searchWiki()
  }

  function keydown(event) {
    if (event.ctrlKey && event.key === "2") {
      event.preventDefault()
      view.focus()
    }
  }

  function redoAction({ dispatch }) {
    const { transaction } = redo(view)
    if (transaction) dispatch(transaction)
    return true
  }

  function searchWiki() {
    const position = view.state.selection.ranges[0].from
    const line = view.state.doc.lineAt(view.state.selection.ranges[0].from)

    const phrase = getPhraseFromPosition(line, position)
    const escaped = phrase.text.replace(".", "%2E")

    if ($completionsMap.some(v => v.label == phrase.text)) dispatch("search", escaped)
  }

  function createSelection({ from, to }) {
    view.dispatch({
      selection: EditorSelection.create([
        EditorSelection.range(from, to)
      ])
    })
  }
</script>

<svelte:window
  on:keydown={keydown}
  on:create-selection={({ detail }) => createSelection(detail)} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div bind:this={element} on:click={click}></div>

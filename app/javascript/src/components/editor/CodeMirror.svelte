<script>
  import { onDestroy, onMount, createEventDispatcher } from "svelte"
  import { basicSetup } from "codemirror"
  import { EditorView, highlightTrailingWhitespace, keymap } from "@codemirror/view"
  import { EditorState, EditorSelection, Transaction } from "@codemirror/state"
  import { indentUnit, StreamLanguage, syntaxHighlighting } from "@codemirror/language"
  import { autocompletion } from "@codemirror/autocomplete"
  import { redo } from "@codemirror/commands"
  import { linter, lintGutter } from "@codemirror/lint"
  import { indentationMarkers } from "@replit/codemirror-indentation-markers"
  import rainbowBrackets from "rainbowbrackets"
  import { OWLanguage, highlightStyle } from "@lib/OWLanguageLegacy"
  import { OWLanguageLinter } from "@lib/OWLanguageLinter"
  import { parameterTooltip } from "@lib/parameterTooltip"
  import { extraCompletions } from "@lib/extraCompletions"
  import { codeActions } from "@lib/codeActions"
  import { transformParameterObjectsIntoPositionalParameters } from "@lib/codeActionProviders/transformParameterObjectsIntoPositionalParameters"
  import { foldBrackets } from "@lib/foldBrackets"
  import { currentItem, editorStates, editorScrollPositions, items, currentProjectUUID, completionsMap, variablesMap, subroutinesMap, mixinsMap, settings } from "@stores/editor"
  import { translationsMap } from "@stores/translationKeys"
  import { getPhraseFromPosition, inConfigType } from "@utils/parse"
  import { tabIndent, autoIndentOnEnter, indentMultilineInserts, pasteIndentAdjustments } from "@utils/codemirror/indent"
  import { get } from "svelte/store"
  import { indentedLineWrap } from "@utils/codemirror/indentedLineWrap"
  import { removeTrailingWhitespace } from "@utils/codemirror/removeTrailingWhitespace"
  import debounce from "@src/debounce"
  import { directlyInsideParameterObject } from "@src/utils/compiler/parameterObjects"
  import { getCompletions } from "@src/utils/codemirror/completions"

  const dispatch = createEventDispatcher()
  const updateItem = debounce(() => {
    $currentItem = {
      ...$currentItem,
      content: view.state.doc.toString()
    }

    const index = $items.findIndex(i => i.id == $currentItem?.id)
    if (index !== -1) $items[index] = $currentItem
  }, 250)

  let element
  let view
  let currentId
  let updatingState = false

  $: if ($currentProjectUUID) $editorStates = {}
  $: if ($currentItem?.id != currentId && view) updateEditorState()
  $: if ($currentItem?.forceUpdate) updateEditorState()

  onMount(() => {
    view = new EditorView({
      parent: element
    })

    // This is here purely to initiliaze these derived stores, which might not happen in time for CodeMirror completions
    // I don't fully understand how this works, but it does.
    ;[$variablesMap, $subroutinesMap, $mixinsMap, $translationsMap]
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
          override: [getCompletions],
          closeOnBlur: false,
          hintOptions: /[()\[\]{};:>,+-=]/
        }),
        lintGutter(),
        linter(OWLanguageLinter),
        indentUnit.of("    "),
        keymap.of([
          { key: "Tab", run: (view) => tabIndent(view, event) },
          { key: "Shift-Tab", run: (view) => tabIndent(view, event)  },
          { key: "Enter", run: autoIndentOnEnter },
          { key: "Shift-Enter", run: autoIndentOnEnter },
          { key: "Ctrl-Shift-z", run: redoAction },
          { key: "Ctrl-s", run: removeTrailingWhitespace }
        ]),
        EditorView.updateListener.of((transaction) => {
          handleTransactionDocChanged(view, transaction)
          updateItem()
          if (transaction.selectionSet) {
            $editorStates[currentId].selection = view.state.selection
            searchScrollMargin(view, transaction)
          }
        }),
        basicSetup,
        parameterTooltip(),
        indentationMarkers(),
        rememberScrollPosition(),
        codeActions([
          transformParameterObjectsIntoPositionalParameters
        ]),
        foldBrackets(),
        ...($settings["word-wrap"] ? [EditorView.lineWrapping, indentedLineWrap] : []),
        ...($settings["highlight-trailing-whitespace"] ? [highlightTrailingWhitespace()] : []),
        ...($settings["rainbow-brackets"] ? [rainbowBrackets()] : [])
      ]
    })
  }

  function handleTransactionDocChanged(view, transaction) {
    if (transaction.docChanged) {
      // Only perform this function if transaction is of an expected type performed by the user
      // to prevent infinite loops on changes made by CodeMirror.
      const userEvents = transaction.transactions.map(tr => tr.annotation(Transaction.userEvent))

      if (userEvents.every(eventType => eventType === "input.complete")) {
        autocompleteFormatting(view, transaction)
      } else if (userEvents.every(eventType => eventType === "input.paste")) {
        pasteIndentAdjustments(view, transaction)
      }
    }
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

  function searchScrollMargin(view, transaction) {
    if (transaction.transactions[0].annotations[0].value !== "select.search") return

    view.dispatch ({
      effects: EditorView.scrollIntoView (
        view.state.selection.main.head,
        { yMargin: 110 }
      )
    })
  }

  function autocompleteFormatting(view, transaction) {
    indentMultilineInserts(view, transaction)
    if ($settings["autocomplete-semicolon"])
      insertSemicolon(view, transaction)
  }

  function insertSemicolon(view, transaction) {
    const line = view.state.doc.lineAt(transaction.changedRanges[0].fromB)
    const phrase = getPhraseFromPosition(line, transaction.changedRanges[0].fromB)
    const possibleValues = $completionsMap.filter(v => v.type === "function")
    const validValue = possibleValues.find(v => v.label == phrase.text)

    if (!validValue?.type) return
    const insertPosition = view.state.selection.ranges[0].from

    view.dispatch({
      changes: { from: insertPosition, insert: ";" },
      selection: EditorSelection.create([
        EditorSelection.range(insertPosition + 1, insertPosition + 1)
      ])
    })
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
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div bind:this={element} on:click={click}></div>

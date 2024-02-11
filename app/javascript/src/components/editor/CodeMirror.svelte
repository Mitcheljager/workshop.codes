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
  import debounce from "../../debounce"

  const dispatch = createEventDispatcher()

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
      setScrollPosition()
    })
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
            indentMultilineInserts(transaction)
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

  function autoIndentOnEnter({ state, dispatch }) {
    const changes = state.changeByRange(range => {
      const { from, to } = range, line = state.doc.lineAt(from)

      const indent = getIndentForLine(state, from, from - line.from)
      let insert = "\n"
      for (let i = 0; i < indent; i++) { insert += "\t" }

      if (shouldNextLineBeIndent(line.text)) insert += "\t"

      return { changes: { from, to, insert }, range: EditorSelection.cursor(from + insert.length) }
    })

    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }))
    return true
  }

  function tabIndent({ state, dispatch }, event) {
    const { shiftKey } = event

    if (element.querySelector(".cm-tooltip-autocomplete")) return true

    const changes = state.changeByRange(range => {
      const { from, to } = range, line = state.doc.lineAt(from)

      let insert = ""

      if (from == to && !shiftKey) {
        const previousIndent = getIndentForLine(state, from - 1)
        const currentIndent = getIndentForLine(state, from)

        insert = "\t"
        if (currentIndent < previousIndent) {
          for (let i = 0; i < previousIndent - 1; i++) { insert += "\t" }
        }

        return {
          changes: { from, to, insert },
          range: EditorSelection.cursor(from + insert.length)
        }
      } else {
        let insert = view.state.doc.toString().substring(line.from, to)

        const originalLength = insert.length
        const leadingWhitespaceLength = insert.search(/\S/)

        if (shiftKey) {
          if (!/^\s/.test(insert[0]) && !(insert.includes("\n ") || insert.includes("\n\t"))) return { range: EditorSelection.range(from, to) }

          const firstChar = insert[0]
          insert = insert.replaceAll(/\n[ \t]/g, "\n").substring(insert.search(/\S/) ? 1 : 0, insert.length)
          insert = (/^\n/.test(firstChar) ? "\n" : "").concat(insert)
        } else {
          insert = "\t" + insert.replaceAll("\n", "\n\t")
        }

        //'line.from' and 'from' are equal at start of line, dont reduce indents lower than 0.
        const fromModifier = line.from === from ? 0 : (insert.search(/\S/) - leadingWhitespaceLength - (from === to ? 1: 0))
        const toModifier = insert.length - originalLength

        return {
          changes: { from: line.from, to, insert },
          range: EditorSelection.range(from + fromModifier, to + toModifier)
        }
      }
    })

    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }))
    dispatch({ selection: EditorSelection.create(changes.selection.ranges) })

    return true
  }

  function getIndentForLine(state, line, charLimit) {
    let lineText = state.doc.lineAt(Math.max(line, 0)).text
    lineText = charLimit !== undefined ? lineText.slice(0, charLimit) : lineText

    return getIndentCountForText(lineText)
  }

  function getIndentCountForText(text) {
    const tabs = /^\t*/.exec(text)?.[0].length
    const spaces = /^\s*/.exec(text)?.[0].length - tabs

    return Math.floor(spaces / 4) + tabs
  }

  function shouldNextLineBeIndent(text) {
    const isComment = text.includes("//")
    const openBracket = !isComment && /[\{\(\[]/gm.exec(text)?.[0].length
    const closeBracket = !isComment && /[\}\)\]]/gm.exec(text)?.[0].length

    return !!(openBracket && !closeBracket)
  }

  const updateItem = debounce(() => {
    $currentItem = {
      ...$currentItem,
      content: view.state.doc.toString()
    }

    const index = $items.findIndex(i => i.id == $currentItem.id)
    if (index !== -1) $items[index] = $currentItem
  }, 250)

  function click(event) {
    if (!event.altKey) return

    event.preventDefault()
    searchWiki()
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

  /**
   * Returns a plguin that updates a store of scroll positions when the view is scrolled.
   * The view is also scrolled when updating the view, but we don't want to store that position.
   * For this we use the updatingState flag to determine if it was a user scroll or a update scroll.
   */
  function rememberScrollPosition(event) {
    return EditorView.domEventHandlers({
      scroll(event, view) {
        if (updatingState) return

        $editorScrollPositions = {
          ...$editorScrollPositions,
          [currentId]: view.scrollDOM.scrollTop
        }
      }
    })
  }

  function setScrollPosition() {
    view.scrollDOM.scrollTo({ top: $editorScrollPositions[currentId] || 0 })
  }

  function indentMultilineInserts(transaction) {
    // Only perform this function if transaction is of an expected type performed by the user to prevent infinite loops on changes made by CodeMirror
    if (transaction.transactions.every(tr => ["input.paste", "input.complete"].includes(tr.annotation(Transaction.userEvent)))) {
      const [range] = transaction.changedRanges
      const rangeLine = view.state.doc.lineAt(range.fromB)
      const text = transaction.state.doc.toString().slice(range.fromB, range.toB)
      const splitText = text.split("\n")

      let startIndentCount = 0
      let firstIndentCount = 0
      const mappedText = splitText.map((line, i) => {
        if (!i) {
          firstIndentCount = getIndentCountForText(line)
          startIndentCount = getIndentCountForText(rangeLine.text) - firstIndentCount

          return line.replace(/^\s+/, "")
        }

        const currentLineIndentCount = getIndentCountForText(line)
        const totalIndentCount = startIndentCount - firstIndentCount + currentLineIndentCount
        const tabs = "\t".repeat(totalIndentCount)

        return tabs + line.replace(/^\s+/, "")
      })

      const changes = {
        from: range.fromB,
        to: range.toB,
        insert: mappedText.join("\n")
      }

      view.dispatch({ changes })
    }
  }
</script>

<svelte:window
  on:keydown={keydown}
  on:create-selection={({ detail }) => createSelection(detail)} />

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div bind:this={element} on:click={click}></div>

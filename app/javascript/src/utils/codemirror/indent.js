import { EditorSelection, Transaction } from "@codemirror/state"

/**
 * Indent on using tab with special conditions. Indent is reversed while holding shift
 * @param {Object} view CodeMirror view
 * @param {Object} event Event as fired from CodeMirror
 * @returns {Boolean} Should return true on complete
 */
export function tabIndent({ state, dispatch }, event) {
  const { shiftKey, target } = event

  // Do not indent when autocomplete is open
  if (target.closest(".cm-editor").querySelector(".cm-tooltip-autocomplete")) return true

  // Insert tabs for each range, each range meaning a cursor position and/or selection
  const changes = state.changeByRange(range => {
    const { from, to } = range, line = state.doc.lineAt(from)

    let insert = ""

    // Using tab from a regular cursor without a selection
    if (from == to && !shiftKey) {
      const previousIndent = getIndentForLine(state, from - 1)
      const currentIndent = getIndentForLine(state, from)

      insert = "\t"
      if (currentIndent < previousIndent) insert += "\t".repeat(previousIndent - 1)

      return {
        changes: { from, to, insert },
        range: EditorSelection.cursor(from + insert.length)
      }
    } else {
      let insert = state.doc.toString().substring(line.from, to)

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
      const reverseSelection = state.selection.main.head === to
      
      let range = EditorSelection.range(to + toModifier, from + fromModifier)
      if (reverseSelection) range = EditorSelection.range(from + fromModifier, to + toModifier)
      
      return {
        changes: { from: line.from, to, insert },
        range
      }
    }
  })

  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }))
  dispatch({ selection: EditorSelection.create(changes.selection.ranges) })

  return true
}

/**
 * Fine the number of indents of a given line number.
 * @param {Object} state CodeMirror editor state
 * @param {Number} line CodeMirror line number
 * @param {Number} charLimit Max characters given in the text
 * @returns {Number} Number of indents for the given line
 */
export function getIndentForLine(state, line, charLimit) {
  let lineText = state.doc.lineAt(Math.max(line, 0)).text
  lineText = charLimit !== undefined ? lineText.slice(0, charLimit) : lineText

  return getIndentCountForText(lineText)
}

/**
 * Get the number of indents for a given text. One tab means one indent, 4 spaces equal one tab.
 * @param {String} text String to check for number of indents
 * @returns {Number} Number of indents
 */
export function getIndentCountForText(text) {
  const tabs = /^\t*/.exec(text)?.[0].length
  const spaces = /^\s*/.exec(text)?.[0].length - tabs

  return Math.floor(spaces / 4) + tabs
}

/**
 * Returns whether or not the next given line should be indented. This is purely based on there
 * being an opening character without a closing character on the previous line.
 * @param {String} text String to check for expected indent level, should be a single line
 * @returns {Boolean}
 */
export function shouldNextLineBeIndent(text) {
  const isComment = text.includes("//")
  const openBracket = !isComment && /[\{\(\[]/gm.exec(text)?.[0].length
  const closeBracket = !isComment && /[\}\)\]]/gm.exec(text)?.[0].length

  return !!(openBracket && !closeBracket)
}

/**
 * Indent the next line when pressing enter. The number of indents is based on the indents on the
 * previous line as well as there being an opening character on the previous line.
 * @param {Object} view CodeMirror view
 * @returns {Boolean} Should return true on complete
 */
export function autoIndentOnEnter({ state, dispatch }) {
  const changes = state.changeByRange(range => {
    const { from, to } = range, line = state.doc.lineAt(from)

    const cursorPosition = from - line.from
    let indent = getIndentForLine(state, from, cursorPosition)
    if (shouldNextLineBeIndent(line.text.slice(0, cursorPosition))) indent++

    let insert = "\n"
    insert += "\t".repeat(indent)

    return { changes: { from, to, insert }, range: EditorSelection.cursor(from + insert.length) }
  })

  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }))
  return true
}

/**
 * Add indents to multiline inserts. This could be either when pasting multiple lines of code or
 * on autocomplete with results that contain new lines.
 * @param {Object} view CodeMirror view
 * @param {Object} transaction CodeMirror transaction
 */
export function indentMultilineInserts({ state, dispatch }, transaction) {
  // Only perform this function if transaction is of an expected type performed by the user to prevent infinite loops on changes made by CodeMirror
  if (transaction.transactions.every(tr => ["input.paste", "input.complete"].includes(tr.annotation(Transaction.userEvent)))) {
    const [range] = transaction.changedRanges
    const rangeLine = state.doc.lineAt(range.fromB)
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
      const totalIndentCount = Math.max(startIndentCount - firstIndentCount + currentLineIndentCount)
      const tabs = "\t".repeat(totalIndentCount)

      return tabs + line.replace(/^\s+/, "")
    })

    const changes = {
      from: range.fromB,
      to: range.toB,
      insert: mappedText.join("\n")
    }

    dispatch({ changes })
  }
}

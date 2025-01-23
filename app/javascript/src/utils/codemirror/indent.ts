import { EditorSelection, type EditorState, type Transaction } from "@codemirror/state"
import type { Range } from "@src/types/editor"

/** Indent on using tab with special conditions. Indent is reversed while holding shift */
export function tabIndent({ state, dispatch }: { state: EditorState, dispatch: Function }, event: KeyboardEvent): boolean {
  const { shiftKey } = event || {}
  const target = event.target as HTMLElement

  // Do not indent when autocomplete is open
  if (target.closest(".cm-editor")!.querySelector(".cm-tooltip-autocomplete")) return true

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
      const fromModifier = line.from === from ? 0 : (insert.search(/\S/) - leadingWhitespaceLength - (from === to ? 1 : 0))
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

/** Find the number of indents of a given line number. */
export function getIndentForLine(state: EditorState, line: number, charLimit?: number): number {
  let lineText = state.doc.lineAt(Math.max(line, 0)).text
  lineText = charLimit !== undefined ? lineText.slice(0, charLimit) : lineText

  return getIndentCountForText(lineText)
}

/** Get the number of indents for a given text. One tab means one indent, 4 spaces equal one tab. */
export function getIndentCountForText(text: string): number {
  const tabs = /^\t*/.exec(text)![0].length
  const spaces = /^\s*/.exec(text)![0].length

  return Math.floor((spaces - tabs) / 4) + tabs
}

/** Returns whether or not the next given line should be indented. This is purely based on there
 * being an opening character without a closing character on the previous line. */
export function shouldNextLineBeIndent(text: string): boolean {
  const isComment = text.includes("//")
  const openBracket = !isComment && /[\{\(\[]/gm.exec(text)?.[0].length
  const closeBracket = !isComment && /[\}\)\]]/gm.exec(text)?.[0].length

  return !!(openBracket && !closeBracket)
}

/** Indent the next line when pressing enter. The number of indents is based on the indents on the
 * previous line as well as there being an opening character on the previous line. */
export function autoIndentOnEnter({ state, dispatch }: { state: EditorState, dispatch: Function }): boolean {
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

/** Add indents on autocomplete with results that contain new lines. */
export function indentMultilineInserts({ state, dispatch }: { state: EditorState, dispatch: Function }, transaction: Transaction): void {
  const range = getFirstRangeFromTransaction(transaction)

  if (!range) return

  const [from, to] = range
  const rangeLine = state.doc.lineAt(from)
  const text = transaction.state.doc.toString().slice(from, to)
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
    const totalIndentCount = Math.max(0, startIndentCount - firstIndentCount + currentLineIndentCount)
    const tabs = "\t".repeat(totalIndentCount)

    return tabs + line.replace(/^\s+/, "")
  })

  const changes = {
    from,
    to,
    insert: mappedText.join("\n")
  }

  dispatch({ changes })
}

/** Adjust multiline-indents so that the indent on first line matches the rest. */
export function pasteIndentAdjustments({ dispatch }: { dispatch: Function }, transaction: Transaction): void {
  const range = getFirstRangeFromTransaction(transaction)

  if (!range) return

  const [from, to] = range
  const paste = transaction.state.doc.toString().slice(from, to)
  const line = transaction.state.doc.lineAt(from)
  const lineText = line.text.slice(0, from - line.from)

  let indentCount = 0
  if (paste.includes("\n")) {
    while ((lineText[indentCount] == "\t" || lineText[indentCount] == " ") &&
    (paste[indentCount] == "\t" || paste[indentCount] == " ")) {
      indentCount++
    }
  }

  dispatch({
    changes: { from, to: from + indentCount, insert: "" }
  })
}

function getFirstRangeFromTransaction(transaction: Transaction): Range | null {
  let range: Range | null = null

  transaction.changes.iterChangedRanges((fromA, toA, fromB, toB) => {
    range = [fromB, toB]

    return false
  })

  return range
}

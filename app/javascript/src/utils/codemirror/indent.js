import { EditorSelection, Transaction } from "@codemirror/state"

export function tabIndent({ state, dispatch }, event) {
  const { shiftKey, target } = event

  if (target.querySelector(".cm-tooltip-autocomplete")) return true

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

export function getIndentForLine(state, line, charLimit) {
  let lineText = state.doc.lineAt(Math.max(line, 0)).text
  lineText = charLimit !== undefined ? lineText.slice(0, charLimit) : lineText

  return getIndentCountForText(lineText)
}

export function getIndentCountForText(text) {
  const tabs = /^\t*/.exec(text)?.[0].length
  const spaces = /^\s*/.exec(text)?.[0].length - tabs

  return Math.floor(spaces / 4) + tabs
}

export function shouldNextLineBeIndent(text) {
  const isComment = text.includes("//")
  const openBracket = !isComment && /[\{\(\[]/gm.exec(text)?.[0].length
  const closeBracket = !isComment && /[\}\)\]]/gm.exec(text)?.[0].length

  return !!(openBracket && !closeBracket)
}

export function autoIndentOnEnter({ state, dispatch }) {
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

export function indentMultilineInserts(view, transaction) {
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

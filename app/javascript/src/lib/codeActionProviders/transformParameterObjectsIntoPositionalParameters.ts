import { completionsMap, settings } from "@stores/editor"
import { getClosingBracket, getPhraseFromPosition, splitArgumentsString } from "@utils/parse"
import { get } from "svelte/store"
import { parseParameterObjectContent } from "@utils/compiler/parameterObjects"
import { getIndentForLine } from "@utils/codemirror/indent"
import type { CodeAction } from "../codeActions"
import type { EditorState } from "@codemirror/state"
import type { EditorView } from "codemirror"

export function transformParameterObjectsIntoPositionalParameters({ view, state }: { view: EditorView, state: EditorState }): CodeAction[] | void {
  const actions: CodeAction[] = []

  const { from: cursorFrom, to: cursorTo } = state.selection.main
  if (cursorFrom !== cursorTo) return

  const line = state.doc.lineAt(cursorFrom)
  if (!line.text) return

  const phrase = getPhraseFromPosition(line, cursorFrom)
  const completion = get(completionsMap).find(({ type, label }) => type === "function" && label === phrase.text)
  if (!completion) return

  const fileWideActionNameStart = line.from + phrase.start
  const fileWideActionNameEnd = line.from + phrase.end + 1

  const actionCallCont = state.doc.sliceString(fileWideActionNameEnd, fileWideActionNameEnd + 100)
  const openParenIndex = actionCallCont.match(/(?<=^\s*)\(/)?.index ?? -1
  if (openParenIndex < 0) return

  const closingParenIndex = getClosingBracket(" " + actionCallCont, "(", ")", 0) // this function is cursed...
  if (closingParenIndex < 0) return

  const fileWideParenFrom = fileWideActionNameEnd + openParenIndex
  const fileWideParenTo = fileWideActionNameEnd + closingParenIndex

  // empty positional parameters
  if (fileWideParenTo - fileWideParenFrom <= "()".length) return

  const openParameterObjectBracketIndex = actionCallCont.slice(openParenIndex + 1).match(/(?<=^\s*)\{/)?.index ?? -1
  if (openParameterObjectBracketIndex >= 0) {
    // parameter object → positional parameters

    const closingParameterObjectBracketIndex = getClosingBracket(actionCallCont, "{", "}", 0)
    if (closingParameterObjectBracketIndex < 0) return

    const fileWideParameterObjectFrom = (fileWideParenFrom + 1) + openParameterObjectBracketIndex
    const fileWideParameterObjectTo = (fileWideParenFrom + 1) + closingParameterObjectBracketIndex

    // there is other stuff after the parameter object (that is not white space)
    if (!(/^\s*$/.test(state.doc.sliceString(fileWideParameterObjectTo, fileWideParenTo - 1)))) return

    actions.push({
      label: "Transform parameter object into normal parameters",
      position: fileWideActionNameStart,
      run() {
        const parameterObject = state.doc.sliceString(fileWideParameterObjectFrom + 1, fileWideParameterObjectTo - 1)
        const parameters = parseParameterObjectContent(parameterObject).result

        const argumentList = completion.parameter_keys
          .map((key, index) => parameters[key] ?? completion.parameter_defaults[index])
          .join(", ")

        view.dispatch(
          view.state.update({
            changes: {
              from: fileWideParenFrom,
              to: fileWideParenTo,
              insert: `(${argumentList})`
            }
          })
        )
      }
    })
  } else {
    // positional parameters → parameter object

    actions.push({
      label: "Transform parameters into a parameter object",
      position: fileWideActionNameStart,
      run() {
        const args = splitArgumentsString(state.doc.sliceString(fileWideParenFrom + 1, fileWideParenTo - 1))

        const isMultiLine = args.length > get(settings)["autocomplete-min-parameter-newlines"]
        const indent = "\t".repeat(getIndentForLine(state, cursorFrom, cursorFrom))

        let parameterObject = "{"

        if (isMultiLine) parameterObject += "\n"
        else parameterObject += " "

        parameterObject += args
          .map((value, index) => {
            const keyValue = `${completion.parameter_keys[index]}: ${value.trim()}`
            return (isMultiLine ? (indent + "\t") : "") + keyValue
          })
          .join(",\n")

        if (isMultiLine) parameterObject += "\n" + indent
        else parameterObject += " "

        parameterObject += "}"

        view.dispatch(
          view.state.update({
            changes: {
              from: fileWideParenFrom,
              to: fileWideParenTo,
              insert: `(${parameterObject})`
            }
          })
        )
      }
    })
  }

  return actions
}

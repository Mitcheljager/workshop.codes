import { completionsMap } from "../../stores/editor"
import { getClosingBracket, getPhraseFromPosition, splitArgumentsString } from "../../utils/parse"
import { get } from "svelte/store"
import { parseParameterObjectContent } from "../../utils/compiler/parameterObjects"

/**
 * @type {import("../codeActions").CodeActionProvider}
 */
export function transformParameterObjectsIntoPositionalParameters({ view, state }) {
  const actions = []

  const { from: start, to: end } = state.selection.main
  if (start !== end) return

  const line = state.doc.lineAt(start)
  if (!line.text) return null

  const phrase = getPhraseFromPosition(line, start)
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

  const openParameterObjectBracketIndex = actionCallCont.slice(openParenIndex).match(/(?<=^\s*)\{/)?.index ?? -1
  if (actionCallCont.slice(1).trimStart()[0] === "{") {
    // parameter object → positional parameters

    const closingParameterObjectBracketIndex = getClosingBracket(actionCallCont, "{", "}", 0)
    if (closingParameterObjectBracketIndex < 0) return

    const fileWideParameterObjectFrom = fileWideParenFrom + openParameterObjectBracketIndex
    const fileWideParameterObjectTo = fileWideParenFrom + closingParameterObjectBracketIndex

    actions.push({
      label: "Transform object into positional parameters",
      position: fileWideActionNameStart,
      run() {
        const parameterObject = state.doc.sliceString(fileWideParameterObjectFrom, fileWideParameterObjectTo)
        const parameters = parseParameterObjectContent(parameterObject, 0)

        const argumentList = completion.parameter_keys
          .map((key, index) => parameters[key] ?? completion.parameter_defaults[index])
          .join(", ")

        view.dispatch(
          view.state.update({
            changes: {
              from: fileWideParenFrom,
              to: fileWideParenTo,
              insert: `(${ argumentList })`
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

        // TODO(netux): indent according to "Autocomplete parameter objects → Minimum newline length"

        const parameterObject = `{ ${ args
          .map((value, index) => `${ completion.parameter_keys[index] }: ${ value.trim() }`)
          .join(", ") } }`

        view.dispatch(
          view.state.update({
            changes: {
              from: fileWideParenFrom,
              to: fileWideParenTo,
              insert: `(${ parameterObject })`
            }
          })
        )
      }
    })
  }

  return actions
}

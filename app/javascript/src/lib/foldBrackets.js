import { foldService } from "@codemirror/language"
import { getClosingBracket } from "@utils/parse"

/**
 * Returns fold out for curly brackets. Returns the values between the brackets, leaving the brackets in place.
 */
export function foldBrackets() {
  return foldService.of((state, from) => {
    const foldStart = state.doc.lineAt(from)
    const startBracket = foldStart.text.search("{")

    if (startBracket === -1) return

    const matchingBracketIndex = getClosingBracket(state.doc.toString(), "{", "}", from - 1)

    if (matchingBracketIndex === -1) return

    const foldEnd = state.doc.lineAt(matchingBracketIndex)

    if (foldStart.number === foldEnd.number) return

    return { from: foldStart.from + startBracket + 1, to: matchingBracketIndex }
  })
}

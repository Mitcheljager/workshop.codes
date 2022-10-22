import { getClosingBracket } from "../utils/editor"
import { completionsMap } from "../stores/editor"
import { get } from "svelte/store"

let diagnostics = []

export function OWLanguageLinter(view) {
  diagnostics = []

  const content = view.state.doc.toString()

  findMissingClosingCharacters(content)
  findIncorrectArgsLength(content)

  return diagnostics
}

function findMissingClosingCharacters(content) {
  const openingCharacters = [
    { open: "{", close: "}", message: "Missing closing curly bracket \"{\"" },
    { open: "[", close: "]", message: "Missing closing square bracket \"[\"" },
    { open: "(", close: ")", message: "Missing closing parenthesis \"(\"" }
  ]

  openingCharacters.forEach(({ open, close, message }) => {
    const openingBrackets = findAllCharacters(content, open)
    openingBrackets.forEach(index => {
      const closingBracketIndex = getClosingBracket(content, open, close, index - 1)

      if (closingBracketIndex < content.length) return

      diagnostics.push({ from: index, to: index + 1, severity: "error", message })
    })
  })
}

function findIncorrectArgsLength(content) {
  const $completionsMap = get(completionsMap)

  const phraseIdentifier = /.+?(?=[\(\)\{\};,=\[\]])/g
  const matches = []
  let match
  let index = 0
  while ((match = phraseIdentifier.exec(content)) != null && index < 10000) {
    matches.push({ match: match[0], index: match.index })
    index++
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i]
    const name = match.match?.replaceAll(/[\(\)\{\};,=\[\]\t]/g, "").trim()

    if (!name) continue

    for(let j = 0; j < $completionsMap.length; j++) {
      const item = $completionsMap[j]

      if (item.label != name) continue

      let message = ""

      if (item.args_length && content.charAt(match.index + match.match.length) != "(") {
        // Some arguments expected but none were given
        message = `${ item.args_length } Argument(s) expected, 0 given`
      } else if (!item.args_length && content.charAt(match.index + match.match.length) == "(") {
        // No arguments expected but some (or ()) were given
        message = "0 arguments expected"
      } else if (item.args_length && content.charAt(match.index + match.match.length) == "(") {
        // Get the number of arguments
        const closing = getClosingBracket(content, "(", ")", match.index)

        let argumentsString = content.slice(match.index + match.match.length + 1, closing)
        let safeIndex = 0
        let argumentMatch
        while ((argumentMatch = /\(/g.exec(argumentsString)) != null && safeIndex < 100) {
          const argumentClosing = getClosingBracket(argumentsString, "(", ")", argumentMatch.index - 1)
          argumentsString = argumentsString.substring(0, argumentMatch.index) + argumentsString.substring(argumentClosing + 1)

          safeIndex++
        }

        const splitContent = argumentsString.split(",")

        if (item.args_min_length && splitContent.length >= item.args_min_length && splitContent.length <= item.args_length) break
        if (!item.args_min_length && splitContent.length == item.args_length) break

        const expectedString = `${ item.args_min_length ? "Atleast" : "" } ${ item.args_min_length || item.args_length }`
        const maxString = `${ item.args_min_length ? ` (${ item.args_length } max)` : "" }`
        const givenString = `${ splitContent.length } given`

        message = `${ expectedString } Argument(s) expected${ maxString }, ${ givenString }`
      }

      if (!message) break

      diagnostics.push({
        from: match.index + match.match.length - name.length,
        to: match.index + match.match.length,
        severity: "error",
        message: message
      })

      break
    }
  }
}

function findAllCharacters(content, character = "{") {
  const indices = []

  for(let i = 0; i < content.length; i++) {
    if (content[i] == character) indices.push(i)
  }

  return indices
}

import { getClosingBracket } from "../utils/editor"
import { completionsMap } from "../stores/editor"
import { get } from "svelte/store"

let diagnostics = []

export function OWLanguageLinter(view) {
  diagnostics = []

  const content = view.state.doc.toString()

  findMissingClosingCharacters(content)
  findIncorrectArgsLength(content)
  findMissingQuotes(content)
  findMissingSemicolons(content)
  checkMixins(content)

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

function findMissingQuotes(content) {
  let followingQuote = -1
  let escaped = false

  for(let i = 0; i < content.length; i++) {
    if (escaped) {
      escaped = false
      continue
    }

    if (content[i] == "\\") {
      escaped = true
      continue
    }

    if (content[i] == "\"") {
      if (followingQuote != -1) followingQuote = -1
      else followingQuote = i
    }

    if (followingQuote != -1 && content[i] == "\n") {
      diagnostics.push({
        from: followingQuote,
        to: i,
        severity: "error",
        message: "Missing closing string quote"
      })

      followingQuote = -1
    }
  }
}

function findIncorrectArgsLength(content) {
  const $completionsMap = get(completionsMap)

  const phraseIdentifier = /.+?(?=[\(\)\{\};,=\[\]])/g
  const matches = []
  let match
  let index = 0
  while ((match = phraseIdentifier.exec(content)) != null && index < 10_000) {
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

      if (item.args_unlimited) continue

      if (item.args_length && content.charAt(match.index + match.match.length) != "(") {
        if (item.args_allow_null) continue
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

function checkMixins(content) {
  // Fix missing parentehsis for mixin declare and include
  const mixinRegex = /(@mixin|@include)\s\w+/g
  let match
  while ((match = mixinRegex.exec(content)) != null) {
    try {
      const closing = getClosingBracket(content, "(", ")", match.index)
      if (closing >= content.length) throw new Error("Missing closing parenthesis")

      const string = content.slice(match.index, closing)
      const opening = string.indexOf("(")
      const openingIndex = match.index + opening

      if (opening < 0) throw new Error("Missing opening parenthesis")

      const stringToOpening = content.slice(match.index, openingIndex)
      const firstNewLine = stringToOpening.indexOf("\n")
      const firstNewLineIndex = match.index + firstNewLine

      if (firstNewLine > 0 && firstNewLineIndex < openingIndex) throw new Error("Missing opening parenthesis")
    } catch (error) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: "error",
        message: error.message
      })
    }
  }
}

function findMissingSemicolons(content) {
  let inRule = false
  let escaped = false
  let bracketCount = 0
  let inString = false
  let inComment = false
  let parenthesisCount = 0

  for(let i = 0; i < content.length; i++) {
    if (i > 10_000) {
      diagnostics.push({
        from: i - 1,
        to: i,
        severity: "warning",
        message: "Content too large, no longer finding missing semicolons"
      })

      return
    }

    if (escaped) {
      escaped = false
      continue
    }

    if (content[i] == "\\") {
      escaped = true
      continue
    }

    if (content[i] == "\"") {
      inString = !inString
      continue
    }

    if (content[i] == "/" && content[i] == "/") {
      inComment = true
      continue
    }

    if (inComment && content[i] == "\n") {
      inComment = false
      continue
    }

    if (content[i] == "r" && content[i + 1] == "u"  && content[i + 2] == "l"  && content[i + 3] == "e"  && content[i + 4] == "(") { // This is dumb
      inRule = true
      continue
    }

    if (content[i] == "(") {
      parenthesisCount++
      continue
    }

    if (content[i] == ")") {
      parenthesisCount--
      continue
    }

    if (!inRule) continue
    if (inString) continue
    if (inComment) continue
    if (parenthesisCount) continue

    if (content[i] == "{") {
      bracketCount++
      continue
    }

    if (content[i] == "}") {
      bracketCount--
      if (bracketCount <= 0) inRule = false
      continue
    }

    if (content[i] == "\n" && content[i - 1] != ";") {
      if (content[i - 1] == "{") continue
      if (content[i - 1] == "}") continue

      const leadingNonEmpty = findFirstNonEmptyCharacter(content.slice(0, i).split("").reverse().join("")) // Reverse all content leading up to current i
      if (leadingNonEmpty == "{" || leadingNonEmpty == "}"  || leadingNonEmpty == "\"") continue
      if (findOpenBeforeClose(content.slice(i, content.length), "{", "}")) continue
      if (findFirstNonEmptyCharacter(content.slice(i, content.length)) == "[") continue

      diagnostics.push({
        from: i - 1,
        to: i,
        severity: "error",
        message: "Missing semicolon",
        actions: [{
          name: "Insert Semicolon",
          apply(view, from, to) {
            view.dispatch({
              changes: { from, to, insert: `${ content[i - 1] };` }
            })
          }
        }]
      })
    }
  }
}

function findFirstNonEmptyCharacter(content) {
  for(let i = 0; i < content.length; i++) {
    if ((/\s/).test(content[i])) continue
    return content[i]
  }
}

function findOpenBeforeClose(content, open, close) {
  let foundOpen = false
  let foundClose = false

  for(let i = 0; i < content.length; i++) {
    if ((/\s/).test(content[i])) continue
    if (content[i] == close) foundClose = true
    if (content[i] == open) foundOpen = true

    if (foundClose && !foundOpen) return false
    if (foundOpen && !foundClose) return true
  }
}

import { findRangesOfStrings, getClosingBracket, getPhraseFromPosition, matchAllOutsideRanges, splitArgumentsString } from "@utils/parse"
import { completionsMap, modal, subroutinesMap, workshopConstants } from "@stores/editor"
import { get } from "svelte/store"
import { getFirstParameterObject } from "@utils/compiler/parameterObjects"
import type { EditorView } from "codemirror"
import { forceLinting, type Diagnostic } from "@codemirror/lint"
import type { Severity, TranslationKey } from "@src/types/editor"
import type { Line } from "@codemirror/state"
import { defaultLanguage, translationKeys } from "@src/stores/translationKeys"
import { Modal } from "@src/constants/Modal"

let diagnostics: Diagnostic[] = []

export function OWLanguageLinter(view: EditorView): Diagnostic[] {
  diagnostics = []

  const content = view.state.doc.toString()

  findMissingClosingCharacters(content)
  findIncorrectArgsLength(content)
  findMissingQuotes(content)
  findMissingSemicolons(content)
  findExtraSemicolons(content)
  findMissingComparisonsInConditions(content)
  findTrailingCommas(content)
  findConditionalsRegexErrors(content)
  findEachLoopsWithInvalidIterables(content)
  findEventBlocksWithMissingArguments(content)
  findUndefinedSubroutines(content)
  findTripleEquals(content)
  checkMixins(content)
  checkTranslations(content)
  checkForLoops(content)

  return diagnostics
}

function findMissingClosingCharacters(content: string): void {
  const openingCharacters = [
    { open: "{", close: "}", message: "Missing closing curly bracket \"{\"" },
    { open: "[", close: "]", message: "Missing closing square bracket \"[\"" },
    { open: "(", close: ")", message: "Missing closing parenthesis \"(\"" }
  ]

  openingCharacters.forEach(({ open, close, message }) => {
    const openingBrackets = findAllCharacters(content, open)
    openingBrackets.forEach(index => {
      const closingBracketIndex = getClosingBracket(content, open, close, index - 1)

      if (closingBracketIndex !== -1) return

      diagnostics.push({ from: index, to: index + 1, severity: "error", message })
    })
  })
}

function findMissingQuotes(content: string): void {
  let followingQuote = -1
  let escaped = false

  for (let i = 0; i < content.length; i++) {
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

function findIncorrectArgsLength(content: string): void {
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

      if (item.label != name || item.type === "constant") continue

      let message = ""
      let severity: Severity = "error"

      if (item.args_unlimited) continue

      if (!item.args_length && content.charAt(match.index + match.match.length) == "(") {
        // No arguments expected but some (or ()) were given
        message = "0 arguments expected"
      } else if (item.args_length && content.charAt(match.index + match.match.length) == "(") {
        // Get the number of arguments
        let closing = getClosingBracket(content, "(", ")", match.index)
        if (closing === -1) closing = content.length

        let argumentsString = content.slice(match.index + match.match.length + 1, closing)
        let safeIndex = 0
        let argumentMatch
        while ((argumentMatch = /\(/g.exec(argumentsString)) != null && safeIndex < 100) {
          const argumentClosing = getClosingBracket(argumentsString, "(", ")", argumentMatch.index - 1)
          if (argumentClosing === -1) break
          argumentsString = argumentsString.substring(0, argumentMatch.index) + argumentsString.substring(argumentClosing + 1)

          safeIndex++
        }

        const splitContent = splitArgumentsString(argumentsString)

        // Arguments string is a parameter object
        if (argumentsString.trim()[0] === "{") {
          const parameterObject = getFirstParameterObject(content.slice(match.index, closing + 1))

          if (!parameterObject) break

          const invalidArgument = parameterObject.givenKeys.filter(i => i && !parameterObject.phraseParameters.includes(i) && !i.startsWith("//"))
          const duplicateArgument = parameterObject.givenKeys.find((key, index) => parameterObject.givenKeys.indexOf(key) !== index)

          if (invalidArgument?.length) {
            message = `Argument(s) "${invalidArgument.join(", ")}" are not valid for "${name}"`
            severity = "warning"
          } else if (duplicateArgument) {
            message = `Argument "${duplicateArgument}" is duplicated`
            severity = "warning"
          } else {
            break
          }
        } else {
          // Argument string is a regular list of arguments
          if (item.args_min_length && splitContent.length >= item.args_min_length && splitContent.length <= item.args_length) break
          if (!item.args_min_length && splitContent.length == item.args_length) break

          const expectedString = `${item.args_min_length ? "Atleast" : ""} ${item.args_min_length || item.args_length}`
          const maxString = `${item.args_min_length ? ` (${item.args_length} max)` : ""}`
          const givenString = `${splitContent.length} given`

          message = `${expectedString} Argument(s) expected${maxString}, ${givenString}`
        }

      }

      if (!message) break

      diagnostics.push({
        from: match.index + match.match.length - name.length,
        to: match.index + match.match.length,
        severity,
        message: message
      })

      break
    }
  }
}

function findAllCharacters(content: string, character = "{"): number[] {
  const indices = []

  let inString = false
  let inComment = false

  for(let i = 0; i < content.length; i++) {
    if (content[i] == "\"") {
      inString = !inString
      continue
    }

    if (content[i] == "/" && content[i + 1] == "/") {
      inComment = true
      continue
    }

    if (inComment && content[i] == "\n") {
      inComment = false
    }

    if (inString) continue
    if (inComment) continue

    if (content[i] == character) indices.push(i)
  }

  return indices
}

function checkMixins(content: string): void {
  // Fix missing parentehsis for mixin declare and include
  const mixinRegex = /(@mixin|@include)\s\w+/g
  let match
  while ((match = mixinRegex.exec(content)) != null) {
    try {
      const closing = getClosingBracket(content, "(", ")", match.index)
      if (closing === -1) throw new Error("Missing closing parenthesis")

      const string = content.slice(match.index, closing)
      const opening = string.indexOf("(")
      const openingIndex = match.index + opening

      if (opening < 0) throw new Error("Missing opening parenthesis")

      const stringToOpening = content.slice(match.index, openingIndex)
      const firstNewLine = stringToOpening.indexOf("\n")
      const firstNewLineIndex = match.index + firstNewLine

      if (firstNewLine > 0 && firstNewLineIndex < openingIndex) throw new Error("Missing opening parenthesis")
    } catch (error: any) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: "error",
        message: error.message
      })
    }
  }
}

function checkTranslations(content: string): void {
  const regex = /(@translate(?<isStatic>\.static)?)\s*\(/g

  let match
  while ((match = regex.exec(content)) != null) {
    const isStatic = !!match.groups?.isStatic // If `.static` is given

    if (!isStatic) {
      let walk = match.index
      let parenthesisBeforeAtIndex = -1
      let inString = false

      while(walk) {
        const char = content[walk]
        if (char == "\"") inString = !inString
        if (!inString) {
          if ([";"].includes(char)) break
          if (char == "@" && content.slice(walk, walk + 6) == "@mixin") break
          if (char == "(") parenthesisBeforeAtIndex = walk
        }
        walk--
      }

      if (parenthesisBeforeAtIndex === -1) {
        diagnostics.push({
          from: match.index,
          to: match.index + match[1].length,
          severity: "warning",
          message: "Using @translate outside of an action has no effect"
        })
        continue
      }

      const line: Line = { text: content, from: 0, to: 0, number: 0, length: 0 }

      // Find translations that are not in client side actions
      const phrase = getPhraseFromPosition(line, parenthesisBeforeAtIndex - 1)
      const acceptedPhrases = ["Create HUD Text", "Create In-World Text", "Create Progress Bar HUD Text", "Create Progress Bar In-World Text", "Set Objective Description", "Big Message", "Small Message", "Array"]

      if (phrase?.text.includes("include")) continue

      if (phrase?.text && !acceptedPhrases.includes(phrase.text)) {
        diagnostics.push({
          from: match.index,
          to: match.index + match[1].length,
          severity: "warning",
          message: `Using @translate inside of "${phrase.text}" has no effect.`
        })
        continue
      }
    }

    // Check translate parameters
    const translateStartParenthesisIndex = match.index + match[0].length - 1
    const translateEndParenthesisIndex = getClosingBracket(content, "(", ")", translateStartParenthesisIndex - 1)
    if (translateEndParenthesisIndex === -1) continue

    const translateArgumentsString = content.substring(translateStartParenthesisIndex + 1, translateEndParenthesisIndex)
    const translateArguments = splitArgumentsString(translateArgumentsString)
    if (translateArguments.length === 0) continue

    if (!translateArguments[0].startsWith("\"") || !translateArguments[0].endsWith("\"")) {
      diagnostics.push({
        from: match.index + match[0].length,
        to: match.index + match[0].length + translateArguments[0].length,
        severity: "error",
        message: "Key argument of @translate must be a string."
      })
      continue
    }

    if (translateArguments.length > 1 && isStatic) {
      const secondArgumentStart = translateArgumentsString.indexOf(translateArguments[1], translateArguments[0].length)

      diagnostics.push({
        from: translateStartParenthesisIndex + secondArgumentStart + 1,
        to: translateEndParenthesisIndex,
        severity: "warning",
        message: "Additional arguments in static translations will have no effect."
      })
      continue
    }

    // Provide option to create translation key via linter
    const translateKey = translateArguments[0].substring(1, translateArguments[0].length - 1)
    const hasTranslateKey = translateKey in get(translationKeys)
    if (!hasTranslateKey) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[1].length,
        severity: "warning",
        message: "Unknown translate key.",
        actions: [{
          name: "Create translation key",
          apply(view) {
            const newTranslation: TranslationKey = {}
            const currentDefaultLanguage = get(defaultLanguage)

            if (currentDefaultLanguage) {
              newTranslation[currentDefaultLanguage] = translateKey
            }

            translationKeys.update((keys) => ({
              ... keys,
              [translateKey]: newTranslation
            }))

            modal.show(Modal.TranslationKeys, {
              props: {
                initialSelectedKey: translateKey
              }
            })

            forceLinting(view)
          }
        }]
      })
      continue
    }
  }
}

function checkForLoops(content: string): void {
  // Find missing parenthesis and keywords
  const forRegex = /@for\s+(.*?)\s*\{\n/g
  let match
  while ((match = forRegex.exec(content)) != null) {
    try {
      const [_, params] = match

      if (params[0] !== "(") throw new Error("Missing opening parenthesis")
      if (params[params.length - 1] !== ")") throw new Error("Missing closing parenthesis")

      const splitParams = params.split(/\s+/)
      const toThroughIndex = splitParams.findIndex((s) => /\b(to|through)\b/.test(s))
      if (toThroughIndex < 0) throw new Error("Either \"to\" or \"through\" are expected")

      if (
        splitParams.length > 3 &&
        toThroughIndex !== 1 &&
        splitParams[toThroughIndex - 2] !== "from"
      ) {
        throw new Error("Missing \"from\" after iterator name")
      }

    } catch (error: any) {
      diagnostics.push({
        from: match.index,
        to: match.index + match[0].length,
        severity: "error",
        message: error.message
      })
    }
  }
}

function findMissingSemicolons(content: string): void {
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

    if (content[i] == "/") {
      if(content[i + 1] == "/" || content[i + 1] == "*") {
        inComment = true
        continue
      }
    }

    if (content.slice(i, i + 2) == "*/") {
      inComment = true
      continue
    }

    if (inComment && content[i] == "\n") {
      inComment = false
      continue
    }

    if (content.slice(i, i + 5) == "rule(") {
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
      if (leadingNonEmpty == ";" || leadingNonEmpty == "{" || leadingNonEmpty == "}" || leadingNonEmpty == "\"" || leadingNonEmpty == "\n") continue
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
              changes: { from, to, insert: `${content[i - 1]};` }
            })
          }
        }]
      })
    }
  }
}

function findExtraSemicolons(content: string): void {
  for(let i = 0; i < content.length; i++) {
    if (content[i] == "}" && content[i + 1] == ";") {
      diagnostics.push({
        from: i,
        to: i + 2,
        severity: "error",
        message: "Unexpected semicolon"
      })
    }
  }
}

function findFirstNonEmptyCharacter(content: string): string {
  for(let i = 0; i < content.length; i++) {
    if (content[i] == "\n") return content[i]
    if ((/\s/).test(content[i])) continue
    return content[i]
  }

  return ""
}

function findOpenBeforeClose(content: string, open: string, close: string): boolean {
  let foundOpen = false
  let foundClose = false

  for(let i = 0; i < content.length; i++) {
    if ((/\s/).test(content[i])) continue
    if (content[i] == close) foundClose = true
    if (content[i] == open) foundOpen = true

    if (foundClose && !foundOpen) return false
    if (foundOpen && !foundClose) return true
  }

  return false
}

function findMissingComparisonsInConditions(content: string): void {
  const mixinRegex = /(conditions[\s]*{)/g
  let match
  while ((match = mixinRegex.exec(content)) != null) {
    const closing = getClosingBracket(content, "{", "}", match.index)
    const conditionContent = content.slice(match.index + match[0].length, closing)

    // Get indexes of semicolons
    const semicolons = findAllCharacters(conditionContent, ";")

    for(let i = 0; i < semicolons.length; i++) {
      const start = i == 0 ? 0 : (semicolons[i - 1] + 1)
      const end = semicolons[i]
      const condition = conditionContent.substring(start, end)

      if (condition.includes("@contents")) continue

      // Remove all content that is between parenthesis
      const conditionWithoutParenthesis = condition.replaceAll(/\([^\)]*\)/g, "")

      // Ignore conditions that hold mixins
      if (conditionWithoutParenthesis.includes("@include") || conditionWithoutParenthesis.includes("Mixin.")) continue

      // Pass if content contains any comparison symbols
      if (conditionWithoutParenthesis.match(/==|<|>|>=|<=|!=/)) continue

      diagnostics.push({
        from: match.index + match[0].length + start + condition.search(/\S/),
        to: match.index + match[0].length + end,
        severity: "error",
        message: "Expected condition to have a comparison"
      })
    }
  }
}

function findTrailingCommas(content: string): void {
  const regex = /,[\n\s\t]+[\],\)]/g
  let match
  while ((match = regex.exec(content)) != null) {
    diagnostics.push({
      from: match.index,
      to: match.index + 1,
      severity: "error",
      message: "Trailing commas are not allowed"
    })
  }
}

function findConditionalsRegexErrors(content: string): void {
  const regex = /(~=[ \n]*)(.*)[ \n]*\)[ \n]*\{/g // matches "~= righthand) {" and "~= /regex/flags) {"
  const regexRegex = /\/(.*)\/(\w*)/ // TODO: share this with compiler.js?
  let match
  while ((match = regex.exec(content)) != null) {
    const [_, beforeRighthand, righthand] = match
    const righthandIsRegexMatch = righthand.match(regexRegex)
    const from = match.index + beforeRighthand.length
    const to = match.index + beforeRighthand.length + righthand.length
    if (righthandIsRegexMatch) {
      const [_, pattern, flags] = righthandIsRegexMatch
      try {
        new RegExp(pattern, flags)
      } catch (err) {
        diagnostics.push({
          from,
          to,
          severity: "error",
          message: `Invalid RegExp: ${err}`
        })
      }
    } else {
      diagnostics.push({
        from,
        to,
        severity: "error",
        message: "Expected a RegExp for the righthand side of this test"
      })
    }
  }
}

function findEachLoopsWithInvalidIterables(content: string): void {
  const constants = get(workshopConstants)

  const regex = /@each\s*\(.+in\s+(.+)\s*\)\s*\{/g
  const variableIterableRegex = /(Constant|Mixin|For|Each)\.([\w\s]*)/

  let match
  while ((match = regex.exec(content)) != null) {
    const [eachFull, iterableStr] = match

    if (iterableStr[0] === "[" && iterableStr[iterableStr.length - 1] === "]") {
      continue
    }

    const constantMatch = variableIterableRegex.exec(eachFull)
    if (constantMatch != null) {
      const [constantFull, constantType, constantName] = constantMatch

      if (constantType === "Constant" && !constants[constantName]) {
        const from = match.index + constantMatch.index
        diagnostics.push({
          from,
          to: from + constantFull.length,
          severity: "error",
          message: `"${constantName}" is not a known Workshop Constant`
        })
      }

      continue
    }

    const from = match.index + eachFull.lastIndexOf(iterableStr)
    diagnostics.push({
      from,
      to: from + iterableStr.length,
      severity: "error",
      message: "@each iterable must be an array in the format [item1, item2, ...], or a Workshop Constant in the format Constant.Name (e.g. Constant.Button)"
    })
  }
}

const eventTypeToArgumentsMap = {
  "subroutine": ["SubroutineName"],
  "ongoing - each player": ["Team", "Player"],
  "player dealt damage": ["Team", "Player"],
  "player dealt final blow": ["Team", "Player"],
  "player dealt healing": ["Team", "Player"],
  "player dealt knockback": ["Team", "Player"],
  "player died": ["Team", "Player"],
  "player earned elimination": ["Team", "Player"],
  "player joined match": ["Team", "Player"],
  "player left match": ["Team", "Player"],
  "player received healing": ["Team", "Player"],
  "player received knockback": ["Team", "Player"],
  "player took damage": ["Team", "Player"]
}

function findEventBlocksWithMissingArguments(content: string): void {
  const eventBlockRegex = /event\s*\{\s*/g

  let eventBlockMatch
  while ((eventBlockMatch = eventBlockRegex.exec(content)) != null) {
    const eventBlockStart = eventBlockMatch.index + eventBlockMatch[0].length
    const eventBlockEnd = getClosingBracket(content, "{", "}", eventBlockMatch.index)

    const [eventType, ... givenEventArgs] = content.substring(eventBlockStart, eventBlockEnd)
      .split(";")
      .map((s) => s.trim())
      .filter((s) => !!s)

    if (!eventType) return

    // @ts-ignore
    const requiredEventArgs = eventTypeToArgumentsMap[eventType.toLowerCase()]

    if (requiredEventArgs && requiredEventArgs.length !== givenEventArgs.length) {
      const missingArguments = requiredEventArgs.slice(givenEventArgs.length)
      diagnostics.push({
        from: eventBlockStart,
        to: eventBlockStart + eventType.length,
        severity: "error",
        message: `Events ${eventType} require ${requiredEventArgs.length} arguments, but you are missing the following: ${missingArguments.join(", ")}`
      })
    }
  }
}

function findUndefinedSubroutines(content: string): void {
  const definedSubroutines = get(subroutinesMap).map(({ label }: { label: string }) => label)

  for (const match of content.matchAll(/(?<=(?:Call Subroutine|Start Rule))\(/g)) {
    const argsEnd = getClosingBracket(content, "(", ")", match.index - 1)

    if (argsEnd === -1) continue

    const [subroutineName] = splitArgumentsString(content.substring(match.index + 1, argsEnd))

    if (!definedSubroutines.includes(subroutineName)) {
      const from = match.index + 1
      diagnostics.push({
        from,
        to: from + subroutineName.length,
        severity: "error",
        message: `There is no subroutine rule with name "${subroutineName}"`
      })
    }
  }
}

function findTripleEquals(content: string): void {
  const stringRanges = findRangesOfStrings(content)

  for (const match of matchAllOutsideRanges(stringRanges, content, /===/g)) {
    const from = match.index
    diagnostics.push({
      from,
      to: from + match[0].length,
      severity: "error",
      message: "Use single equals for assignments, or double equals to comparisons. Triple equals doesn't exist here (this isn't JavaScript!)."
    })
  }
}

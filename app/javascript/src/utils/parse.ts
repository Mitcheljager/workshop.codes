import type { Line } from "@codemirror/state"
import type { ConfigType, Range } from "@src/types/editor"

export function getClosingBracket(content: string, characterOpen = "{", characterClose = "}", start = 0): number {
  let closePos = start
  let counter = 1
  let initial = true

  while (counter > 1 || initial) {
    const c = content[++closePos]

    if (c == characterOpen) {
      counter++
      initial = false
    }
    else if (c == characterClose) counter--
    if (counter > 20 || closePos > (100_000 + start) || closePos >= content.length) return -1
  }

  return closePos
}

export function splitArgumentsString(content: string): string[] {
  let ignoredByString = false
  let ignoredByBrackets = 0

  const commaIndexes: number[] = []

  for (let i = 0; i < content.length; i++) {
    if (content[i] == "\\")
      i++
    else if (content[i] == "\"")
      ignoredByString = !ignoredByString
    else if (!ignoredByString && ["(", "[", "{"].includes(content[i]))
      ignoredByBrackets++
    else if (!ignoredByString && [")", "]", "}"].includes(content[i]))
      ignoredByBrackets = Math.min(ignoredByBrackets - 1 || 0)
    else if (!ignoredByString && !ignoredByBrackets && content[i] == ",")
      commaIndexes.push(i)
  }

  if (!commaIndexes.length) return [content]

  const splitArguments = []
  splitArguments.push(content.substring(0, commaIndexes[0]))

  commaIndexes.forEach((comma, index) => {
    splitArguments.push(content.substring(comma + 1, commaIndexes[index + 1]).trim())
  })

  return splitArguments
}

export function getSettings(value: string): number[] {
  const regex = new RegExp(/settings/)
  const match = regex.exec(value)
  if (!match) return []

  const untilIndex = match.index + getClosingBracket(value.slice(match.index, value.length))
  if (!untilIndex) return []

  return [match.index, untilIndex + 1]
}

export function replaceBetween(origin: string, replace: string, startIndex: number, endIndex: number): string {
  return origin.substring(0, startIndex) + replace + origin.substring(endIndex)
}

export function getPhraseEnd(text: string, start: number, direction = 1): number {
  let lastValidCharacterPosition = start

  for (let i = 1; i < 100; i++) {
    const char = text[start + i * direction]
    if (char !== undefined && /[A-Za-z\- ]/.test(char)) lastValidCharacterPosition += direction
    else i = 100
  }

  return lastValidCharacterPosition
}

export function getPhraseFromPosition(line: Line, position: number): { start: number, end: number, text: string } {
  const start = getPhraseEnd(line.text, position - line.from, -1)
  const end = getPhraseEnd(line.text, position - line.from, 1)

  return {
    start,
    end,
    text: line.text.slice(start, end + 1).trim()
  }
}

export function getPhraseFromIndex(text: string, index: number): string {
  const start = getPhraseEnd(text, index, -1)
  const end = getPhraseEnd(text, index, 1)

  return text.slice(start, end + 1).trim()
}

export function removeSurroundingParenthesis(source: string): string {
  const openMatch = /^[\s\n]*\(/.exec(source)
  const closeMatch = /\)[\s\n]*$/.exec(source)

  return openMatch != null && closeMatch != null
    ? removeSurroundingParenthesis(source.substring(openMatch.index + openMatch[0].length, closeMatch.index))
    : source
}

export function findRangesOfStrings(source: string): Range[] {
  const foundRanges = []

  let currentRangeIndex = null

  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\"") {
      if (currentRangeIndex == null) {
        currentRangeIndex = i
      } else if (source[i - 1] !== "\\") {
        const range: Range = [currentRangeIndex, i + 1]
        foundRanges.push(range)

        currentRangeIndex = null
      }
    }
  }

  return foundRanges
}

export function matchAllOutsideRanges(ranges: Range[], content: string, regex: RegExp): RegExpExecArray[] {
  const matches = []
  for (const match of content.matchAll(regex)) {
    const isInsideRange = ranges.some((range: Range) => match.index >= range[0] && match.index + match[0].length <= range[1])

    if (isInsideRange) continue

    matches.push(match)
  }

  return matches
}

export function getCommasIndexesOutsideQuotes(string: string): number[] {
  const commaIndexes = []
  const stringRanges = findRangesOfStrings(string)

  for (let i = 0; i < string.length; i++) {
    if (!(string[i] === "," || string[i] === ",")) continue

    const withinStringRange = stringRanges.some(([start, end]) => i > start && i < end)
    if (!withinStringRange) commaIndexes.push(i)
  }

  return commaIndexes
}

/** Returns whether the position is inside event, conditions, actions, or none */
export function inConfigType(content: string, startIndex = 0): ConfigType | null {
  if (startIndex > content.length) return null
  if (startIndex < 0) return null

  let bracketCount = 0
  let index = 0
  for (index = startIndex - 1; index >= 0; index--) {
    if (content[index] === "{") bracketCount--
    if (content[index] === "}") bracketCount++

    if (bracketCount < 0) {
      if (/\s/.test(content[index]) || content[index] === "{") continue

      if (content[index] === "(") bracketCount++
      else break
    }
  }

  if (index <= 0) return null

  const phraseStart = getPhraseEnd(content, index, -1)
  const phraseEnd = getPhraseEnd(content, index, 1)
  const phrase = content.slice(phraseStart, phraseEnd + 1).trim()

  if (["event", "conditions", "actions"].includes(phrase)) return phrase as ConfigType

  return null
}

/** Whether or not a position is inside a value, determine by being inside of parenthesis `()` */
export function isInValue(content: string, startIndex = 0): boolean {
  let parenthesisCount = 0
  let index = 0
  for (index = startIndex - 1; index >= 0; index--) {
    if (content[index] === "(") parenthesisCount--
    if (content[index] === ")") parenthesisCount++
    if (content[index] === ";") break
  }

  return parenthesisCount < 0
}

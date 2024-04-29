export function getClosingBracket(content, characterOpen = "{", characterClose = "}", start = 0) {
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

export function splitArgumentsString(content) {
  let ignoredByString = false
  let ignoredByBrackets = 0
  const commaIndexes = []

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

export function getSettings(value) {
  const regex = new RegExp(/settings/)
  const match = regex.exec(value)
  if (!match) return []

  const untilIndex = match.index + getClosingBracket(value.slice(match.index, value.length))
  if (!untilIndex) return []

  return [match.index, untilIndex + 1]
}

export function replaceBetween(origin, replace, startIndex, endIndex) {
  return origin.substring(0, startIndex) + replace + origin.substring(endIndex)
}

export function getPhraseEnd(text, start, direction = 1) {
  let lastValidCharacterPosition = start
  for (let i = 1; i < 100; i++) {
    const char = text[start + i * direction]
    if (char !== undefined && /[A-Za-z\- ]/.test(char)) lastValidCharacterPosition += direction
    else i = 100
  }

  return lastValidCharacterPosition
}

export function getPhraseFromPosition(line, position) {
  const start = getPhraseEnd(line.text, position - line.from, -1)
  const end = getPhraseEnd(line.text, position - line.from, 1)

  return {
    start,
    end,
    text: line.text.slice(start, end + 1).trim()
  }
}

export function getPhraseFromIndex(text, index) {
  const start = getPhraseEnd(text, index, -1)
  const end = getPhraseEnd(text, index, 1)

  return text.slice(start, end + 1).trim()
}

export function removeSurroundingParenthesis(source) {
  const openMatch = /^[\s\n]*\(/.exec(source)
  const closeMatch = /\)[\s\n]*$/.exec(source)
  return openMatch != null && closeMatch != null
    ? removeSurroundingParenthesis(source.substring(openMatch.index + openMatch[0].length, closeMatch.index))
    : source
}

export function findRangesOfStrings(source) {
  const foundRanges = []

  let currentRangeIndex = null

  for (let i = 0; i < source.length; i++) {
    if (source[i] === "\"") {
      if (currentRangeIndex == null) {
        currentRangeIndex = i
      } else if (source[i - 1] !== "\\") {
        const range = [currentRangeIndex, i + 1]
        foundRanges.push(range)

        currentRangeIndex = null
      }
    }
  }

  return foundRanges
}

export function matchAllOutsideRanges(ranges, content, regex) {
  const matches = []
  for (const match of content.matchAll(regex)) {
    const isInsideRange = ranges.some((range) => match.index >= range[0] && match.index + match[0].length <= range[1])
    if (isInsideRange) {
      continue
    }
    matches.push(match)
  }
  return matches
}

export function getCommasIndexesOutsideQuotes(string) {
  const commaIndexes = []

  let insideQuotes = false

  for (let i = 0; i < string.length; i++) {
    if (string[i] === "\"" || string[i] === "'") {
      insideQuotes = !insideQuotes
    } else if ((string[i] === "," || string[i] === ",") && !insideQuotes) {
      commaIndexes.push(i)
    }
  }

  return commaIndexes
}

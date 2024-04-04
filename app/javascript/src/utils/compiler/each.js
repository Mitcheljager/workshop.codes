import { workshopConstants } from "@stores/editor"
import { defaultLanguage } from "@stores/translationKeys"
import { getClosingBracket, replaceBetween } from "@utils/parse"
import { openArrayBracketRegex, openToClosingArrayBracketsMap } from "@utils/compiler/constants"
import { get } from "svelte/store"

export function evaluateEachLoops(joinedItems) {
  const eachRegex = /@each\s*\((\w+)(?:,\s+(\w+))?\s+in\s+(\[.*?\]|(?:Constant)\.[\w\s]+)\s*\)\s*\{/gs

  let match
  while ((match = eachRegex.exec(joinedItems)) != null) {
    const [_, valueVar, indexVar, iterableStr] = match

    let iterable = []
    if (iterableStr[0] === "[" && iterableStr[iterableStr.length - 1] === "]") {
      iterable = parseArrayValues(iterableStr.substring(1, iterableStr.length - 1))
    } else if (iterableStr.startsWith("Constant.")) {
      const language = get(defaultLanguage)
      const constants = get(workshopConstants)

      const usedConstant = constants[iterableStr.substring("Constant.".length)]

      if (usedConstant != null) {
        iterable = Object.values(usedConstant)
          .map((value) => value[language])
      }
    }

    if (iterable == null) continue

    const openingBracketIndex = match.index + match[0].length - 1
    const closingBracketIndex = getClosingBracket(joinedItems, "{", "}", openingBracketIndex - 1)
    if (closingBracketIndex < 0) {
      continue
    }

    const contentToRepeat = joinedItems.substring(openingBracketIndex + 1, closingBracketIndex)
    const indexVarRegex = new RegExp(`Each.${indexVar || "i"}(?=\\W|$)`, "g")
    const valueVarRegex = new RegExp(`Each.${valueVar}(?=\\W|$)`, "g")

    const finalContent = Object.entries(iterable).reduce((current, [index, value]) => {
      return current + contentToRepeat
        .replaceAll(indexVarRegex, index)
        .replaceAll(valueVarRegex, value)
    }, "")

    joinedItems = replaceBetween(
      joinedItems,
      finalContent,
      match.index,
      closingBracketIndex + 1
    )
    // reset regex last index to right on the replaced content, to allow for nested `@each`s
    eachRegex.lastIndex = match.index
  }

  return joinedItems
}

export function parseArrayValues(input) {
  const commaRegex = /, */g

  const result = []

  let commaMatch
  let nextStartingIndex = 0
  let lastValidCommaEndIndex = -1
  while ((commaMatch = commaRegex.exec(input)) != null) {
    // Check if the comma is inside brackets (e.g. the second comma in "[1, (2, 3), 4]" or "[1, [2, 3], 4]")
    // because the parenthesis group should be taken as one value (e.g. for the previous example, we should
    // return ["1", "(2, 3)", "4"], not ["1", "(2", "3)", "4"])
    openArrayBracketRegex.lastIndex = nextStartingIndex
    const openBracketMatch = openArrayBracketRegex.exec(input)
    if (openBracketMatch != null && openBracketMatch.index < commaMatch.index) {
      const openingBracketChar = openBracketMatch[0]
      const closingBracketChar = openToClosingArrayBracketsMap[openingBracketChar]
      const closingBracketIndex = getClosingBracket(input, openingBracketChar, closingBracketChar, openBracketMatch.index - 1)
      nextStartingIndex = closingBracketIndex < 0 ? input.length : closingBracketIndex + 1
    } else {
      const commaEndIndex = commaMatch.index + commaMatch[0].length - 1
      result.push(input.substring(lastValidCommaEndIndex + 1, commaMatch.index))

      lastValidCommaEndIndex = commaEndIndex
      nextStartingIndex = lastValidCommaEndIndex + 1
    }

    commaRegex.lastIndex = nextStartingIndex
  }

  const lastValue = input.substring(lastValidCommaEndIndex + 1)
  if (
    lastValue.length > 0 ||
    // input ends with a comma outside parentheses, meaning the item is empty
    lastValidCommaEndIndex === input.length - 1
  ) {
    result.push(lastValue)
  }

  return result
    // HACK: line finder inserts [linemarker]s on the input, which may confuse @each
    // into thinking they are nested arrays.
    .map((item) => item.replace(/\s*\[linemarker\].*?\[\/linemarker\]\s*/g, ""))
}

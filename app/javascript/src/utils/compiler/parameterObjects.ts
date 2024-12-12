import type { ParameterObject } from "@src/types/editor"
import { completionsMap } from "@stores/editor"
import { getClosingBracket, getPhraseEnd, getPhraseFromIndex, replaceBetween, splitArgumentsString } from "@utils/parse"
import { get } from "svelte/store"

export function evaluateParameterObjects(joinedItems: string): string {
  let moreAvailableObjects = true
  let safety = 0
  let startFromIndex = 0

  while (moreAvailableObjects) {
    const parameterObject = getFirstParameterObject(joinedItems, startFromIndex)

    if (!parameterObject || safety > 1000) {
      moreAvailableObjects = false
      continue
    }

    if (!parameterObject.phraseParameters.length) {
      startFromIndex = parameterObject.start
      continue
    }

    joinedItems = replaceParameterObject(joinedItems, parameterObject)
    safety++
  }

  return joinedItems
}

/** Obtain an object out of the string contents of a parameter object */
export function parseParameterObjectContent(innerContent: string): { result: Record<string, string>, keys: string[] } {
  const splitParameters = splitArgumentsString(innerContent)
  const result: Record<string, string> = {}
  const keys: string[] = []

  splitParameters.forEach(item => {
    let [key, value] = item.split(/:(.*)/s)

    key = key.replace(/\[linemarker\].*?\[\/linemarker\]/, "").trim()
    value = (value || "").trim()

    if (!key) return

    keys.push(key)
    result[key] = value
  })

  return { result, keys }
}

/**
 * Find the first matching parameter object in a given string. Parameter objects are a special format that allow the user to give only specific sets of parameters rather than having to write them all out.
 * @param content Content to search for parameter objects in.
 * @param startFromIndex Skip over previous results. This is used when the regex format was found without matches phrases to skip over previous results.
 * @returns Object containing details about the parameter object and matching phrase.
 */
export function getFirstParameterObject(content: string, startFromIndex = 0): ParameterObject | null {
  content = content.slice(startFromIndex)

  const regex = /[a-z]\s*\(\s*{/
  const match = content.match(regex)

  if (!match?.index) return null

  let end = getClosingBracket(content, "{", "}", match.index - 1)
  if (end === -1) end = match.index + match.length

  const start = match.index + match[0].indexOf("{")
  const phrase = getPhraseFromIndex(content, match.index)
  const completion = get(completionsMap).find(item => item.args_length && item.label.replace(" ", "") === phrase.replace(" ", ""))
  const innerContent = content.slice(match.index + match[0].length, end).trim()
  const { result: given, keys: givenKeys } = parseParameterObjectContent(innerContent)

  const result = { start: start + startFromIndex, end: end + startFromIndex, given, givenKeys }

  // Return a false object to replace contents of unfound phrase
  if (!completion) return {
    ...result,
    phraseParameters: [],
    phraseDefaults: [],
    phraseTypes: []
  }

  return {
    ...result,
    phraseParameters: completion.parameter_keys,
    phraseDefaults: completion.parameter_defaults,
    phraseTypes: completion.parameter_types
  }
}

/**
 * Replaces and returns a parameter object in the given string.
 * @param content String the parameter object will be replaced in.
 * @param parameterObject Object containing all data needed to replace the expected string. This object contains a start index, end index, given parameters, parameter keys, and parameter defaults.
 * @returns String with parameter object replaced with Workshop code.
 */
export function replaceParameterObject(content: string, parameterObject: ParameterObject): string {
  const { start, end, given, phraseParameters, phraseDefaults } = parameterObject

  if (end > content.length - 1) return content

  const parameters = phraseDefaults.map((parameterDefault, i) => given[phraseParameters[i]] || parameterDefault)
  content = replaceBetween(content, parameters.join(", "), start, end + 1)

  return content
}

/**
 * Returns the parameter object that the cursor is directly inside of, if any.
 */
export function directlyInsideParameterObject(content: string, startIndex = 0): ParameterObject | null {
  if (startIndex > content.length) return null
  if (startIndex < 0) return null

  let bracketCount = 0
  let index = 0
  let hasMetComma = false
  let isNotKey = false
  for (index = startIndex - 1; index > 0; index--) {
    if (content[index] === "{") bracketCount--
    if (content[index] === "}") bracketCount++
    if (content[index] === ",") hasMetComma = true
    if ((content[index] === ":" && !hasMetComma) || content[index] === ";") {
      isNotKey = true
      break
    }

    if (bracketCount < 0) {
      // Only count as parameter object when ( proceeds {, while allowing white space. To prevent things like `actions {` matching as objects.
      if (/\s/.test(content[index])) continue
      if (content[index] === "(") break
    }
  }

  if (isNotKey) return null

  const phraseStart = getPhraseEnd(content, index - 1, -1)

  if (phraseStart < 0) return null

  const parameterObject = getFirstParameterObject(content.slice(phraseStart, content.length))

  if (!parameterObject) return null
  if (parameterObject.start > startIndex) return null

  return  parameterObject
}

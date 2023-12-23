import { completionsMap } from "../../stores/editor"
import { getClosingBracket, getPhraseFromIndex, replaceBetween, splitArgumentsString } from "../parse"
import { get } from "svelte/store"

export function evaluateParameterObjects(joinedItems) {
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

/**
 * Find the first matching parameter object in a given string. Parameter objects are a special format that allow the user to give only specific sets of parameters rather than having to write them all out.
 * @param {string} content Content to search for parameter objects in.
 * @param {*} startFromIndex Skip over previous results. This is used when the regex format was found without matches phrases to skip over previous results.
 * @returns {object|null} Object containing details about the parameter object and matching phrase.
 */
export function getFirstParameterObject(content, startFromIndex = 0) {
  content = content.slice(startFromIndex)

  const regex = /[a-z]\s*\(\s*{/
  const match = content.match(regex)

  if (!match) return null

  let end = getClosingBracket(content, "{", "}", match.index - 1)
  if (end === -1) end = match.index + match.length

  const start = match.index + match[0].indexOf("{")
  const phrase = getPhraseFromIndex(content, match.index)
  const completion = get(completionsMap).find(item => item.args_length && item.label.replace(" ", "") === phrase.replace(" ", ""))
  const string = content.slice(match.index + match[0].length, end).trim()
  const splitParameters = splitArgumentsString(string)
  const given = {}

  splitParameters.forEach(item => {
    const [key, value] = item.split(/:(.*)/s)
    given[key.trim()] = (value || "").trim()
  })

  const result = { start: start + startFromIndex, end: end + startFromIndex, given }

  // Return a false object to replace contents of unfound phrase
  if (!completion) return {
    ...result,
    phraseParameters: [],
    phraseDefaults: []
  }

  return {
    ...result,
    phraseParameters: completion.parameter_keys,
    phraseDefaults: completion.parameter_defaults
  }
}

/**
 * Replaces and returns a parameter object in the given string.
 * @param {string} content String the parameter object will be replaced in.
 * @param {object} parameterObject Object containing all data needed to replace the expected string. This object contains a start index, end index, given parameters, parameter keys, and parameter defaults.
 * @returns {string} String with parameter object replaced with Workshop code.
 */
export function replaceParameterObject(content, parameterObject) {
  const { start, end, given, phraseParameters, phraseDefaults } = parameterObject

  if (end > content.length - 1) return content

  const parameters = phraseDefaults.map((parameterDefault, i) => given[phraseParameters[i]] || parameterDefault)
  content = replaceBetween(content, parameters.join(", "), start, end + 1)

  return content
}

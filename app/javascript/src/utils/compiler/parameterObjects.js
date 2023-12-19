import { completionsMap } from "../../stores/editor"
import { getClosingBracket, getPhraseFromIndex, replaceBetween, splitArgumentsString } from "../parse"
import { get } from "svelte/store"

export function evaluateParameterObjects(joinedItems) {
  let moreAvailableObjects = true
  let safety = 0

  while (moreAvailableObjects) {
    const parameterObject = getFirstParameterObject(joinedItems)

    if (!parameterObject || safety > 10_000) {
      moreAvailableObjects = false
      continue
    }

    joinedItems = replaceParameterObject(joinedItems, parameterObject)
    safety++
  }

  return joinedItems
}

export function getFirstParameterObject(content) {
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

  const result = { start, end, given }

  // Return a false object to replace contents of unfound phrase
  if (!completion) return {
    ...result,
    phraseParameters: [],
    phraseDefaults: []
  }

  return {
    ...result,
    phraseParameters: completion.detail_full.split(", "),
    phraseDefaults: completion.parameter_defaults
  }
}

export function replaceParameterObject(content, parameterObject) {
  const { start, end, given, phraseParameters, phraseDefaults } = parameterObject

  if (end > content.length - 1) return content

  const parameters = phraseDefaults.map((parameterDefault, i) => given[phraseParameters[i]] || parameterDefault)
  content = replaceBetween(content, parameters.join(", "), start, end + 1)

  return content
}

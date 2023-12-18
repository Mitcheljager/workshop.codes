import { completionsMap } from "../../stores/editor"
import { getClosingBracket, getPhraseFromIndex, splitArgumentsString } from "../parse"
import { get } from "svelte/store"

export function evaluateParameterObjects(joinedItems) {
  let moreAvailableObjects = true

  while (moreAvailableObjects) {
    const parameterObject = getFirstParameterObject(joinedItems)

    if (!parameterObject) {
      moreAvailableObjects = false
      continue
    }

    joinedItems = replaceParameterObject(joinedItems, parameterObject)
  }

  return joinedItems
}

export function getFirstParameterObject(content) {
  const regex = /\(\s*{/
  const match = content.match(regex)

  if (!match) return null

  const phrase = getPhraseFromIndex(content, match.index - 1)
  const completion = get(completionsMap).find(item => item.args_length && item.label === phrase)

  if (!completion) return null

  const end = getClosingBracket(content, "{", "}", match.index)
  const string = content.slice(match.index + match[0].length, end).trim()
  const splitParameters = splitArgumentsString(string)
  const given = {}

  splitParameters.forEach(item => {
    const [key, value] = item.split(/:(.+)/)
    given[key.trim()] = value.trim()
  })

  return {
    start: match.index + 1,
    end,
    given,
    phraseParameters: completion.detail_full.split(", "),
    phraseDefaults: completion.parameterDefaults
  }
}

function replaceParameterObject(content, parameterObject) {
  let offset = 0

  const { start, end, given, phraseParameters, phraseDefaults } = parameterObject

  const parameters = phraseDefaults.map((parameterDefault, i) => given[phraseParameters[i]] || parameterDefault)

  const effectiveStart = start + offset
  const effectiveEnd = end + offset

  const prefix = content.slice(0, effectiveStart)
  const suffix = content.slice(effectiveEnd + 1)

  const string = parameters.join(", ")

  content = prefix + string + suffix
  offset += string.length - (effectiveEnd - effectiveStart + 1)

  return content
}

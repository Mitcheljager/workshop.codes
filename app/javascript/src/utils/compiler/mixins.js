import { getClosingBracket, replaceBetween, splitArgumentsString } from "@utils/parse"
import { getFirstParameterObject } from "@utils/compiler/parameterObjects"

export function getMixins(joinedItems) {
  let mixins = joinedItems.match(/(?<=@mixin\s)[^\s\(]+/g)
  mixins = [...new Set(mixins)]

  return mixins
}

/**
 * Replace and remove all occurances of `@include` and `@mixin`. `@include` is replaced with the declarations of their
 * corresponding `@mixin`.
 * @param {string} joinedItems Given string of the currently parsed compiled items.
 * @returns {string} joinedItems with mixin includes replaced.
 */
export function extractAndInsertMixins(joinedItems) {
  const mixins = {}

  // Find stated mixins and save their names and params to an object
  const mixinRegex = /@mixin/g
  let match
  while ((match = mixinRegex.exec(joinedItems)) != null) {
    let closing = getClosingBracket(joinedItems, "{", "}", match.index)
    if (closing < 0) {
      closing = joinedItems.length
    }
    const content = joinedItems.slice(match.index, closing)
    const name = content.match(/(?<=@mixin\s)(\w+)/)?.[0]

    if (!name) throw new Error("Mixin is missing a name")
    if (mixins[name]) throw new Error(`Mixin "${name}" is already defined`)

    const firstOpenBracket = content.indexOf("{")
    const firstOpenParen = content.indexOf("(")
    const closingParen = getClosingBracket(content, "(", ")", firstOpenParen - 1)
    if (closingParen < 0) {
      continue
    }
    const params = splitArgumentsString(content.slice(firstOpenParen + 1, closingParen).replace(/\s/, ""))
    const paramsDefaults = params
      .map(param => {
        const slicedAt = param.indexOf("=")
        if (slicedAt != -1) return [param.slice(0, param.indexOf("=")), param.slice(param.indexOf("=") + 1)]
        else return [param]
      })
      .map(([key, value]) => ({ key: key.trim(), default: (value || "").trim() }))

    const mixin = content.slice(firstOpenBracket + 1, closing)?.trim()

    if (mixin.includes(`@include ${name}`)) throw new Error("Can not include a mixin in itself")

    mixins[name] = {
      content: mixin,
      full: joinedItems.slice(match.index, closing + 1),
      params: paramsDefaults,
      hasContents: mixin.includes("@contents")
    }
  }

  // Remove mixins from content
  Object.values(mixins).forEach(({ full }) => joinedItems = joinedItems.replace(full, ""))

  // Find stated includes for mixins and replace them with mixins
  while (joinedItems.indexOf("@include") != -1) {
    // Get arguments
    const index = joinedItems.indexOf("@include")
    let closing = getClosingBracket(joinedItems, "(", ")", index + 1)
    if (closing < 0) closing = joinedItems.length
    const full = joinedItems.slice(index, closing + 1)
    const name = full.match(/(?<=@include\s)(\w+)/)?.[0]
    const mixin = mixins[name]
    const parameterObjectGiven = getFirstParameterObject(full)?.given

    if (!mixin) throw new Error(`Included a mixin that was not specified: "${name}"`)

    const argumentsOpeningParen = full.indexOf("(")
    const argumentsClosingParen = getClosingBracket(full, "(", ")", argumentsOpeningParen - 1)
    if (argumentsClosingParen < 0) {
      continue
    }
    const argumentsString = full.slice(argumentsOpeningParen + 1, argumentsClosingParen)
    let splitArguments = splitArgumentsString(argumentsString) || []

    // If there is only one argument and that argument is a parameter object we assume the given argument is not for a param.
    // This allows us to either insert a single parameter object to be used for the mixin or insert multiple to be used for the params.
    if (splitArguments.length === 1 && parameterObjectGiven) splitArguments = []

    // eslint-disable-next-line prefer-const
    let { replaceWith, fullMixin, contents } = replaceContents(joinedItems, index, closing, mixin.content)

    mixin.params
      .map((param, index) => ({ ...param, index }))
      .sort((p1, p2) => p2.key.length - p1.key.length)
      .forEach(param => {
        replaceWith = replaceWith.replaceAll("Mixin." + param.key, splitArguments[param.index]?.trim() || parameterObjectGiven?.[param.key] || param.default)
      })

    const closingSemicolon = (!mixin.hasContents || !contents) && joinedItems[closing + 1] == ";"

    joinedItems = replaceBetween(joinedItems, replaceWith, index, index + ((contents && fullMixin) || full).length + (closingSemicolon ? 1 : 0))
  }

  return joinedItems
}

/**
 * Replace every `@contents` occurance with their corresponding slot from the mixin include.
 * @param {string} joinedItems - The full given content
 * @param {number} index - The starting index of the include
 * @param {number} closing - The index of the closing parenthesis of the include arguments
 * @param {string} replaceWith - String constructed to far to replace the starting value
 * @returns {Object} An object containing the extracted contents of the mixin, the full mixin string (including the declare),
 *                  and the updated content after slot replacement.
 * @throws {Error} If the mixin includes itself
 */
export function replaceContents(joinedItems, index, closing, replaceWith) {
  let contents = ""
  let contentsClosing = getClosingBracket(joinedItems, "{", "}", index)
  if (contentsClosing == -1) contentsClosing = joinedItems.length

  const openingBracketAt = getOpeningBracketAt(joinedItems.slice(closing + 1, joinedItems.length))
  const fullMixin = joinedItems.slice(index, openingBracketAt != -1 ? contentsClosing + 1 : closing + 1)

  if (openingBracketAt != -1) contents = joinedItems.slice(closing + 1 + openingBracketAt + 1, contentsClosing)

  const slotContents = getSlotContents(contents)

  while (replaceWith.indexOf("@contents") != -1) {
    const match = /@contents(?:\("(.+?)"\))?;?/.exec(replaceWith)
    const slot = match[1] || "default"
    const start = match.index
    const end = match.index + match[0].length

    replaceWith = replaceBetween(replaceWith, slotContents[slot] || "", start, end)
  }

  return { contents, fullMixin, replaceWith }
}

/**
 * Get all given slots in the mixin include
 * @param {string} contents Contents of the mixin include
 * @returns {Object} An object containing the extracted slot with their names as keys
 *                   and slot content as value. Includes the default slot.
 */
export function getSlotContents(contents) {
  const slotContents = {}
  const defaultSlotContent = []

  const slotsRegex = /@slot\("([^"]+)"\) {/g
  let lastIndex = 0
  let match

  while ((match = slotsRegex.exec(contents)) !== null) {
    const name = match[1] || ""
    const slotClosing = getClosingBracket(contents, "{", "}", match.index)

    defaultSlotContent.push(contents.slice(lastIndex, match.index).trim())
    slotContents[name] = contents.slice(match.index + match[0].length, slotClosing).trim()
    lastIndex = slotClosing + 1
  }

  // Add content after final slot to default slot
  defaultSlotContent.push(contents.slice(lastIndex).trim())

  return { ...slotContents, default: defaultSlotContent.join("").trim() }
}

/**
 * Get the opening bracket for mixin includes. If there is none, return -1
 * @param {string} content
 * @returns {index} index of the found opening bracket
 */
export function getOpeningBracketAt(content) {
  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === "{") return i
    if (!char.match(/\s/)) return -1
  }
}

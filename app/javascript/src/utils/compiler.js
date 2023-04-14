import { templates } from "../lib/templates"
import { getSettings, getClosingBracket, replaceBetween, splitArgumentsString } from "./editor"
import { flatItems } from "../stores/editor"
import { translationKeys, defaultLanguage, selectedLanguages } from "../stores/translationKeys"
import { languageOptions } from "../lib/languageOptions"
import { get } from "svelte/store"

export function compile(overwriteContent = null) {
  let joinedItems = overwriteContent || get(flatItems)

  joinedItems = removeComments(joinedItems)

  const [settingsStart, settingsEnd] = getSettings(joinedItems)
  let settings = joinedItems.slice(settingsStart, settingsEnd)

  if (!settings || !settingsEnd) settings = templates.Settings

  joinedItems = joinedItems.replace(settings, "")
  joinedItems = extractAndInsertMixins(joinedItems)
  joinedItems = evaluateConditionals(joinedItems)
  joinedItems = convertTranslations(joinedItems)

  const variables = compileVariables(joinedItems)
  const subroutines = compileSubroutines(joinedItems)

  return settings + variables + subroutines + joinedItems
}

export function getVariables(joinedItems) {
  let globalVariables = joinedItems.match(/(?<=Global\.)[^\s,.[\]);]+/g)
  globalVariables = [...new Set(globalVariables)]

  let playerVariables = joinedItems.match(/(?<=(Event Player|Victim|Attacker|Healer|Healee|Local Player)\.)[^\s,.[\]);]+/g)
  playerVariables = [...new Set(playerVariables)]

  return { globalVariables, playerVariables }
}

export function getSubroutines(joinedItems) {
  let subroutines = joinedItems.match(/Subroutine;[\r\n]+([^\r\n;]+)/g) || []
  subroutines = subroutines.map(s => s.replace("Subroutine;\n", "").replace("Call Subroutine", "").replace(/[\())\s]/g, ""))
  return [...new Set(subroutines)]
}

export function getMixins(joinedItems) {
  let mixins = joinedItems.match(/(?<=@mixin\s)[^\s\(]+/g)
  mixins = [...new Set(mixins)]

  return mixins
}

function extractAndInsertMixins(joinedItems) {
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
    if (mixins[name]) throw new Error(`Mixin "${ name }" is already defined`)

    const firstOpenBracket = content.indexOf("{")
    const firstOpenParen = content.indexOf("(")
    const closingParen = getClosingBracket(content, "(", ")", firstOpenParen - 1)
    if (closingParen < 0) {
      continue
    }
    const params = content.slice(firstOpenParen + 1, closingParen).replace(/\s/, "").split(",")
    const paramsDefaults = params
      .map(param => {
        const slicedAt = param.indexOf("=")
        if (slicedAt != -1) return [param.slice(0, param.indexOf("=")), param.slice(param.indexOf("=") + 1)]
        else return [param]
      })
      .map(([key, value]) => ({ key: key.trim(), default: (value || "").trim() }))

    const mixin = content.slice(firstOpenBracket + 1, closing)?.trim()

    mixins[name] = {
      content: mixin,
      full: joinedItems.slice(match.index, closing + 1),
      params: paramsDefaults,
      hasContents: mixin.includes("@contents;")
    }
  }

  // Remove mixins from content
  Object.values(mixins).forEach(({ full }) => joinedItems = joinedItems.replace(full, ""))

  // Find stated includes for mixins and replace them with mixins
  while (joinedItems.indexOf("@include") != -1) {
    // Get arguments
    const index = joinedItems.indexOf("@include")
    let closing = getClosingBracket(joinedItems, "(", ")", index + 1)
    if (closing < 0) {
      closing = joinedItems.length
    }
    const full = joinedItems.slice(index, closing + 1)
    const name = full.match(/(?<=@include\s)(\w+)/)?.[0]
    const mixin = mixins[name]

    if (!mixin) throw new Error(`Included a mixin that was not specified: "${ name }"`)

    const argumentsOpeningParen = full.indexOf("(")
    const argumentsClosingParen = getClosingBracket(full, "(", ")", argumentsOpeningParen - 1)
    if (argumentsClosingParen < 0) {
      continue
    }
    const argumentsString = full.slice(argumentsOpeningParen + 1, argumentsClosingParen)
    const splitArguments = splitArgumentsString(argumentsString) || []

    let replaceWith = mixin.content
    if (replaceWith.includes(`@include ${ name }`)) throw new Error("Can not include a mixin in itself")

    // Get content for @contents
    let fullMixin
    let contents
    if (mixin.hasContents) {
      let contentsClosing = getClosingBracket(joinedItems, "{", "}", index)
      if (contentsClosing) {
        contentsClosing = joinedItems.length
      }
      fullMixin = joinedItems.slice(index, contentsClosing + 1)

      const contentsOpening = fullMixin.indexOf("{")

      if (contentsOpening != -1) {
        contents = fullMixin.slice(contentsOpening + 1, fullMixin.length - 1)
        if (contents.includes(`@include\s${ name }`)) throw new Error("Can not include a mixin in itself")
      }

      replaceWith = replaceWith.replace("@contents;", contents || "")
    }

    let paramIndex = 0
    mixin.params.forEach(param => {
      replaceWith = replaceWith.replaceAll("Mixin." + param.key, splitArguments[paramIndex]?.trim() || param.default)
      paramIndex++
    })

    const closingSemicolon = (!mixin.hasContents || !contents) && joinedItems[closing + 1] == ";"

    joinedItems = replaceBetween(joinedItems, replaceWith, index, index + ((contents && fullMixin) || full).length + (closingSemicolon ? 1 : 0))
  }

  return joinedItems
}

const conditionalOperations = {
  "==": (l, r) => l === r,
  "!=": (l, r) => l !== r
}

function evaluateConditionals(joinedItems) {
  const conditionalStartRegex = new RegExp(`@if *\\( *((?:.|\\n)+?) *(${ Object.keys(conditionalOperations).join("|") }) *((?:.|\\n)+?)\\) *[ \\n]*\\{`, "g")
  const conditionalElseStartRegex = / *@else *\{/

  let match
  while ((match = conditionalStartRegex.exec(joinedItems)) != null) {
    const [matchedConditionalStartText, left, operation, right] = match
    const afterMatchedTextIndex = match.index + matchedConditionalStartText.length

    const afterClosingBracketIndex = getClosingBracket(joinedItems, "{", "}", afterMatchedTextIndex - 2)
    if (afterClosingBracketIndex < 0) {
      continue
    }

    let conditionalEndingIndex = afterClosingBracketIndex - 1

    const trueBlockContent = joinedItems.substring(afterMatchedTextIndex, afterClosingBracketIndex)
    let falseBlockContent = ""

    conditionalElseStartRegex.lastIndex = afterClosingBracketIndex - 1 // set start position for the exec below
    const elseMatch = conditionalElseStartRegex.exec(joinedItems)
    if (elseMatch != null) {
      const afterElseMatchedTextIndex = elseMatch.index + elseMatch[0].length
      const matchingClosingBracketForElseIndex = getClosingBracket(joinedItems, "{", "}", afterElseMatchedTextIndex - 2)
      if (matchingClosingBracketForElseIndex > 0) {
        falseBlockContent = joinedItems.substring(afterElseMatchedTextIndex, matchingClosingBracketForElseIndex)
        conditionalEndingIndex = matchingClosingBracketForElseIndex
      } else {
        continue
      }
    }

    const sanitizedLeft = left.trimEnd()
    const sanitizedRight = right.trimStart()
    const passed = conditionalOperations[operation]?.(sanitizedLeft, sanitizedRight)

    const finalContent = passed ? trueBlockContent : falseBlockContent
    joinedItems = replaceBetween(
      joinedItems,
      finalContent,
      match.index,
      conditionalEndingIndex + 1
    )
    // reset regex last index to right on the replaced content, to allow for nested `@if`s
    conditionalStartRegex.lastIndex = match.index
  }

  return joinedItems
}

function compileVariables(joinedItems) {
  const { globalVariables, playerVariables } = getVariables(joinedItems)

  if (!globalVariables?.length && !playerVariables.length) return ""

  return `
variables {
${ globalVariables.length ? "  global:" : "" }
${ globalVariables.map((v, i) => `    ${ i }: ${ v }`).join("\n") }

${ playerVariables.length ? "  player:" : "" }
${ playerVariables.map((v, i) => `    ${ i }: ${ v }`).join("\n") }
}\n\n`
}

function compileSubroutines(joinedItems) {
  const subroutines = getSubroutines(joinedItems)

  if (!subroutines.length) return ""

  return `
subroutines {
${ subroutines.map((v, i) => `    ${ i }: ${ v }`).join("\n") }
}\n\n`
}

function removeComments(joinedItems) {
  return joinedItems.replaceAll(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "")
}

function convertTranslations(joinedItems) {
  if (!get(selectedLanguages)?.length) return joinedItems
  if (!Object.keys(get(translationKeys) || {})?.length) return joinedItems

  // Find @translate in content and replace with given translation key
  let match
  const includeRegex = /@translate/g
  while ((match = includeRegex.exec(joinedItems)) != null) {
    const closing = getClosingBracket(joinedItems, "(", ")", match.index + 1)
    if (closing < 0) {
      continue
    }
    const full = joinedItems.slice(match.index, closing + 1)

    const argumentsOpeningParen = full.indexOf("(")
    const argumentsClosingParen = getClosingBracket(full, "(", ")", argumentsOpeningParen - 1)
    if (argumentsClosingParen < 0) {
      continue
    }
    const argumentsString = full.slice(argumentsOpeningParen + 1, argumentsClosingParen)
    const splitArguments = splitArgumentsString(argumentsString) || []
    const key = splitArguments[0].replaceAll("\"", "")

    const eachLanguageStrings = []
    get(selectedLanguages).forEach((language) => {
      const translation = get(translationKeys)[key]?.[language] || get(translationKeys)[key]?.[get(defaultLanguage)] || key
      eachLanguageStrings.push(`Custom String("${ translation }"${ splitArguments.length > 1 ? ", " : "" }${ splitArguments.slice(1).join(", ") })`)
    })

    const replaceWith = `Value In Array(
      Array(${ eachLanguageStrings.join(", ") }),
      Max(False, Index Of Array Value(Global.WCDynamicLanguages, Custom String("{0}", Map(Practice Range), Null, Null)))
    )`

    joinedItems = replaceBetween(joinedItems, replaceWith, match.index, match.index + full.length)
  }

  // Array with custom string for Practice Range in each selected language
  const customStringArrayForEachLanguage = get(selectedLanguages).map(language => `Custom String("${ languageOptions[language].detect }")`)
  const rule = `
  rule("Workshop.codes Editor Dynamic Language - Set Languages") {
    event { Ongoing - Global; }
    actions { Global.WCDynamicLanguages = Array(${ customStringArrayForEachLanguage.join(", ") }); }
  }`

  return joinedItems + rule
}

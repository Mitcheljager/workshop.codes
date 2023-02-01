import { templates } from "../lib/templates"
import { getSettings, getClosingBracket, replaceBetween, splitArgumentsString } from "./editor"
import { sortedItems } from "../stores/editor"
import { get } from "svelte/store"

export function compile() {
  let joinedItems = get(sortedItems).map(i => i.content).join("\n\n")

  joinedItems = removeComments(joinedItems)

  const [settingsStart, settingsEnd] = getSettings(joinedItems)
  let settings = joinedItems.slice(settingsStart, settingsEnd)

  if (!settings || !settingsEnd) settings = templates.Settings

  joinedItems = joinedItems.replace(settings, "")
  joinedItems = extractAndInsertMixins(joinedItems)
  joinedItems = convertTranslations(joinedItems)

  const variables = compileVariables(joinedItems)
  const subroutines = compileSubroutines(joinedItems)

  return settings + variables + subroutines + joinedItems
}

function extractAndInsertMixins(joinedItems) {
  const mixins = {}

  // Find stated mixins and save their names and params to an object
  const mixinRegex = /@mixin/g
  let match
  while ((match = mixinRegex.exec(joinedItems)) != null) {
    const closing = getClosingBracket(joinedItems, "{", "}", match.index)
    const content = joinedItems.slice(match.index, closing)
    const name = content.match(/(?<=@mixin\s)(\w+)/)?.[0]

    if (!name) throw new Error("Mixin is missing a name")
    if (mixins[name]) throw new Error(`Mixin "${ name }" is already defined`)

    const firstOpenBracket = content.indexOf("{")
    const firstOpenParen = content.indexOf("(")
    const closingParen = getClosingBracket(content, "(", ")", firstOpenParen - 1)
    const params = content.slice(firstOpenParen + 1, closingParen).replace(/\s/, "").split(",")
    const mixin = content.slice(firstOpenBracket + 1, closing)?.trim()

    mixins[name] = {
      content: mixin,
      full: joinedItems.slice(match.index, closing + 1),
      params: params.map(param => param.trim())
    }
  }

  // Remove mixins from content
  Object.values(mixins).forEach(({ full }) => joinedItems = joinedItems.replace(full, ""))

  // Find stated includes for mixins and replace them with mixins
  const includeRegex = /@include/g
  while ((match = includeRegex.exec(joinedItems)) != null) {
    const closing = getClosingBracket(joinedItems, "(", ")", match.index + 1)
    const full = joinedItems.slice(match.index, closing + 1)
    const name = full.match(/(?<=@include\s)(\w+)/)?.[0]
    const mixin = mixins[name]
    const closingSemicolon = joinedItems[closing + 1] == ";"

    const argumentsOpeningParen = full.indexOf("(")
    const argumentsclosingParen = getClosingBracket(full, "(", ")", argumentsOpeningParen - 1)
    const argumentsString = full.slice(argumentsOpeningParen + 1, argumentsclosingParen)
    const splitArguments = splitArgumentsString(argumentsString) || []

    if (!mixin) throw new Error(`Included a mixin that was not specified: "${ name }"`)

    // Replace mixin params with content
    let replaceWith = mixin.content
    let paramIndex = 0
    mixin.params.forEach(param => {
      replaceWith = replaceWith.replaceAll("Mixin." + param, splitArguments[paramIndex]?.trim() || "")
      paramIndex++
    })

    joinedItems = replaceBetween(joinedItems, replaceWith, match.index, match.index + full.length + (closingSemicolon ? 1 : 0))
  }

  return joinedItems
}

function compileVariables(joinedItems) {
  let globalVariables = joinedItems.match(/(?<=Global\.)[^\s,.[\]);]+/g)
  globalVariables = [...new Set(globalVariables)]

  let playerVariables = joinedItems.match(/(?<=(Event Player|Victim|Attacker|Healer|Healee|Local Player)\.)[^\s,.[\]);]+/g)
  playerVariables = [...new Set(playerVariables)]

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
  let subroutines = joinedItems.match(/Subroutine;[\r\n]+([^\r\n;]+)/g) || []
  subroutines = [...subroutines, ...(joinedItems.match(/Call Subroutine\((.*)\)/g) || [])]
  subroutines = subroutines.map(s => s.replace("Subroutine;\n", "").replace("Call Subroutine", "").replace(/[\())\s]/g, ""))
  subroutines = [...new Set(subroutines)]

  if (!subroutines.length) return ""

  return `
subroutines {
${ subroutines.map((v, i) => `  ${ i }: ${ v }`).join("\n") }
}\n\n`
}

function removeComments(joinedItems) {
  return joinedItems.replaceAll(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "")
}

function convertTranslations(joinedItems) {
  const defaultLanguage = "en"

  const languages = {
    0: "en",
    1: "fr"
  }

  const translationKeys = {
    "Some Key": {
      en: "Test en",
      fr: "Test fr"
    }
  }

  console.log("Finding translations")

  // Find stated includes for mixins and replace them with mixins
  let match
  const includeRegex = /@translate/g
  while ((match = includeRegex.exec(joinedItems)) != null) {
    const closing = getClosingBracket(joinedItems, "(", ")", match.index + 1)
    const full = joinedItems.slice(match.index, closing + 1)
    const closingSemicolon = joinedItems[closing + 1] == ";"

    const argumentsOpeningParen = full.indexOf("(")
    const argumentsclosingParen = getClosingBracket(full, "(", ")", argumentsOpeningParen - 1)
    const argumentsString = full.slice(argumentsOpeningParen + 1, argumentsclosingParen)
    const splitArguments = splitArgumentsString(argumentsString) || []
    const key = splitArguments[0].replaceAll("\"", "")

    console.log(key)

    let eachLanguageString = ""
    Object.entries(languages).forEach(([id, language]) => {
      eachLanguageString += `Local Player.Language == ${ id } ? Custom String("${ translationKeys[key]?.[language] || key }", ${ splitArguments[1] || "null" }, ${ splitArguments[2] || "null" }) : `
    })

    const replaceWith = `Custom String("{0}",
      ${ eachLanguageString }
      Custom String("${ translationKeys[key]?.[defaultLanguage] || key }", ${ splitArguments[1] || "null" }, ${ splitArguments[2] || "null" })
    )`

    console.log(replaceWith)

    joinedItems = replaceBetween(joinedItems, replaceWith, match.index, match.index + full.length + (closingSemicolon ? 1 : 0))
  }

  return joinedItems
}

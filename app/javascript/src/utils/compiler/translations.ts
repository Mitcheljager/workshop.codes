import { languageOptions } from "@lib/languageOptions"
import type { Language } from "@src/types/editor"
import { defaultLanguage, selectedLanguages, translationKeys } from "@stores/translationKeys"
import { getClosingBracket, replaceBetween, splitArgumentsString } from "@utils/parse"
import { get } from "svelte/store"

export function convertTranslations(joinedItems: string, singleLanguageOverride: Language | null = null): string {
  if (!get(selectedLanguages)?.length) return joinedItems
  if (!Object.keys(get(translationKeys) || {})?.length) return joinedItems

  joinedItems = replaceStaticTranslationKeys(joinedItems, singleLanguageOverride)
  joinedItems = replaceDynamicTranslationKeys(joinedItems, singleLanguageOverride)

  if (singleLanguageOverride) return joinedItems

  // Array with custom string for Practice Range in each selected language
  const customStringArrayForEachLanguage = get(selectedLanguages).map(language => `Custom String("${languageOptions[language].detect}")`)
  const rule = `
  rule("Workshop.codes Editor Dynamic Language - Set Languages") {
    event { Ongoing - Global; }
    actions { Global.WCDynamicLanguages = Array(${customStringArrayForEachLanguage.join(", ")}); }
  }`

  return joinedItems + rule
}

/**
 * Replace @translate.static("Key") with "Value". Always compiles to a single language.
 */
function replaceStaticTranslationKeys(joinedItems: string, singleLanguageOverride: Language | null): string {
  const staticRegex = /@translate\.static\(/g

  let match
  while ((match = staticRegex.exec(joinedItems)) != null) {
    const closing = getClosingBracket(joinedItems, "(", ")", match.index + 1)
    if (closing < 0) continue

    const full = joinedItems.slice(match.index, closing + 1)
    const key = full.slice(full.indexOf("(") + 1, full.lastIndexOf(")")).replaceAll("\"", "")
    const translation = getValueForLanguage(key, singleLanguageOverride || get(selectedLanguages)[0])

    joinedItems = replaceBetween(joinedItems, `"${translation}"`, match.index, match.index + full.length)
  }

  return joinedItems
}

/**
 * Replace @translate("Key") with Custom String("Value"), either compiled to a single language or a with dynamic languages.
 */
function replaceDynamicTranslationKeys(joinedItems: string, singleLanguageOverride: Language | null): string {
  const regex = /@translate/g

  let match
  while ((match = regex.exec(joinedItems)) != null) {
    const closing = getClosingBracket(joinedItems, "(", ")", match.index + 1)
    if (closing < 0) continue

    const full = joinedItems.slice(match.index, closing + 1)
    const argumentsOpeningParen = full.indexOf("(")
    const argumentsClosingParen = getClosingBracket(full, "(", ")", argumentsOpeningParen - 1)
    if (argumentsClosingParen < 0) continue

    const argumentsString = full.slice(argumentsOpeningParen + 1, argumentsClosingParen)
    const splitArguments = splitArgumentsString(argumentsString) || []
    const key = splitArguments[0].replaceAll("\"", "")

    const generateLanguageString = (language: Language): string => {
      const translation = getValueForLanguage(key, language)
      return `Custom String("${translation}"${splitArguments.length > 1 ? ", " : ""}${splitArguments.slice(1).join(", ")})`
    }

    const replaceWith = singleLanguageOverride ?
      generateLanguageString(singleLanguageOverride) :
      `Value In Array(
      Array(${get(selectedLanguages).map((language) => generateLanguageString(language)).join(", ")}),
      Max(False, Index Of Array Value(Global.WCDynamicLanguages, Custom String("{0}", Map(Practice Range), Null, Null)))
    )`

    joinedItems = replaceBetween(joinedItems, replaceWith, match.index, match.index + full.length)
  }

  return joinedItems
}

function getValueForLanguage(key: string, language: Language): string {
  return get(translationKeys)[key]?.[language] || get(translationKeys)[key]?.[get(defaultLanguage)] || key
}

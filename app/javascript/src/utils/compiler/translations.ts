import { languageOptions } from "@lib/languageOptions"
import { defaultLanguage, selectedLanguages, translationKeys } from "@stores/translationKeys"
import { getClosingBracket, replaceBetween, splitArgumentsString } from "@utils/parse"
import { get } from "svelte/store"

export function convertTranslations(joinedItems: string): string {
  if (!get(selectedLanguages)?.length) return joinedItems
  if (!Object.keys(get(translationKeys) || {})?.length) return joinedItems

  // Find @translate in content and replace with given translation key
  let match
  const regex = /@translate/g
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

    const eachLanguageStrings: string[] = []
    get(selectedLanguages).forEach((language) => {
      const translation = get(translationKeys)[key]?.[language] || get(translationKeys)[key]?.[get(defaultLanguage)] || key
      eachLanguageStrings.push(`Custom String("${translation}"${splitArguments.length > 1 ? ", " : ""}${splitArguments.slice(1).join(", ")})`)
    })

    const replaceWith = `Value In Array(
      Array(${eachLanguageStrings.join(", ")}),
      Max(False, Index Of Array Value(Global.WCDynamicLanguages, Custom String("{0}", Map(Practice Range), Null, Null)))
    )`

    joinedItems = replaceBetween(joinedItems, replaceWith, match.index, match.index + full.length)
  }

  // Array with custom string for Practice Range in each selected language
  const customStringArrayForEachLanguage = get(selectedLanguages).map(language => `Custom String("${languageOptions[language].detect}")`)
  const rule = `
  rule("Workshop.codes Editor Dynamic Language - Set Languages") {
    event { Ongoing - Global; }
    actions { Global.WCDynamicLanguages = Array(${customStringArrayForEachLanguage.join(", ")}); }
  }`

  return joinedItems + rule
}

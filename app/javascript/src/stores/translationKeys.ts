import type { Language, TranslateKeys } from "@src/types/editor"
import { writable, derived } from "svelte/store"

export const translationKeys = writable<TranslateKeys>({})
export const orderedTranslationKeys = derived(translationKeys, $translationKeys =>
  Object.keys($translationKeys).sort().reduce((result: TranslateKeys, key: string) => {
    result[key] = $translationKeys[key]
    return result
  }, {})
)
export const selectedLanguages = writable<Language[]>(["en-US"])
export const defaultLanguage = writable<Language>("en-US")

export const translationsMap = derived(translationKeys, $translationKeys => {
  const translations = Object.keys($translationKeys)

  return translations.map(v => ({ detail: "Translation Key", label: `@translate("${v}")`, type: "variable" }))
})

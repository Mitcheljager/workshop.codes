import { writable, derived } from "svelte/store"

export const translationKeys = writable({})
export const orderedTranslationKeys = derived(translationKeys, $translationKeys =>
  Object.keys($translationKeys).sort().reduce((result, key) => {
    result[key] = $translationKeys[key]
    return result
  }, {})
)
export const selectedLanguages = writable(["en-US"])
export const defaultLanguage = writable("en-US")

export const translationsMap = derived(translationKeys, $translationKeys => {
  const translations = Object.keys($translationKeys)

  return translations.map(v => ({ detail: "Translation Key", label: `@translate("${v}")`, type: "variable" }))
})

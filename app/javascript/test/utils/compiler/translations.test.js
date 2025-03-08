import { selectedLanguages, translationKeys } from "@stores/translationKeys"
import { convertTranslations } from "@utils/compiler/translations"
import { disregardWhitespace } from "@test/helpers/text"
import { describe, it, expect, afterEach } from "vitest"

describe("translations.js", () => {
  describe("convertTranslations", () => {
    afterEach(() => {
      translationKeys.set({ "Some Key": { "en-US": "Some Value", "de-DE": "German Value" } })
      selectedLanguages.set(["en-US"])
    })

    it("Should return the original input if no selectedLanguages are given", () => {
      selectedLanguages.set([])
      const input = "test @translate(\"Some Key\")"
      expect(convertTranslations(input)).toBe(input)
    })

    it("Should return the original input if no translationKeys are given", () => {
      translationKeys.set({})
      const input = "test @translate(\"Some Key\")"
      expect(convertTranslations(input)).toBe(input)
    })

    it("Should replace @translate with the given value in the expected format", () => {
      const input = "test @translate(\"Some Key\")"
      const expectedOutput = `
      test Value In Array(
        Array(Custom String("Some Value")),
        Max(False, Index Of Array Value(Global.WCDynamicLanguages, Custom String("{0}", Map(Practice Range), Null, Null)))
      )
      rule("Workshop.codes Editor Dynamic Language - Set Languages") {
        event { Ongoing - Global; }
        actions { Global.WCDynamicLanguages = Array(Custom String("Practice Range")); }
      }`
      expect(disregardWhitespace(convertTranslations(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should use the key if no translation is found for given language", () => {
      translationKeys.set({ "Some Key": { } })

      const input = "test @translate(\"Some Key\")"
      const expectedOutput = `
      test Value In Array(
        Array(Custom String("Some Key")),
        Max(False, Index Of Array Value(Global.WCDynamicLanguages, Custom String("{0}", Map(Practice Range), Null, Null)))
      )
      rule("Workshop.codes Editor Dynamic Language - Set Languages") {
        event { Ongoing - Global; }
        actions { Global.WCDynamicLanguages = Array(Custom String("Practice Range")); }
      }`
      expect(disregardWhitespace(convertTranslations(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should include multiple languages if given in selectedLanguages", () => {
      selectedLanguages.set(["en-US", "de-DE"])

      const input = "test @translate(\"Some Key\")"
      const expectedOutput = `
      test Value In Array(
        Array(Custom String("Some Value"), Custom String("German Value")),
        Max(False, Index Of Array Value(Global.WCDynamicLanguages, Custom String("{0}", Map(Practice Range), Null, Null)))
      )
      rule("Workshop.codes Editor Dynamic Language - Set Languages") {
        event { Ongoing - Global; }
        actions { Global.WCDynamicLanguages = Array(Custom String("Practice Range"), Custom String("Trainingsbereich")); }
      }`
      expect(disregardWhitespace(convertTranslations(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should replace with default language if there is no translation for set language", () => {
      selectedLanguages.set(["en-US", "de-DE"])
      translationKeys.set({ "Some Key": { "en-US": "Some Value" } })

      const input = "test @translate(\"Some Key\")"
      const expectedOutput = `
      test Value In Array(
        Array(Custom String("Some Value"), Custom String("Some Value")),
        Max(False, Index Of Array Value(Global.WCDynamicLanguages, Custom String("{0}", Map(Practice Range), Null, Null)))
      )
      rule("Workshop.codes Editor Dynamic Language - Set Languages") {
        event { Ongoing - Global; }
        actions { Global.WCDynamicLanguages = Array(Custom String("Practice Range"), Custom String("Trainingsbereich")); }
      }`
      expect(disregardWhitespace(convertTranslations(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should replace with given language override when given and not include dynamic language strings", () => {
      selectedLanguages.set(["en-US"])
      translationKeys.set({ "Some Key": { "en-US": "Some Value" } })

      const input = "test @translate(\"Some Key\")"
      const expectedOutput = "test Custom String(\"Some Value\")"

      expect(convertTranslations(input, "en-US")).toBe(expectedOutput)
    })
  })
})

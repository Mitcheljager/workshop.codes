import { getClosingBracket, getPhraseEnd, getPhraseFromPosition, getSettings, replaceBetween, splitArgumentsString } from "../../../app/javascript/src/utils/parse"

describe("parse.js", () => {
  describe("getClosingBracket", () => {
    it("Should return the correct closing bracket position", () => {
      const content = "Some {text} with brackets"
      expect(getClosingBracket(content)).toBe(10)
    })

    it("Should return -1 when there is no closing bracket", () => {
      const content = "No closing bracket { in this string"
      expect(getClosingBracket(content)).toBe(-1)
    })

    it("Should handle nested brackets", () => {
      const content = "Nested { { { { brackets } } } }"
      expect(getClosingBracket(content)).toBe(30)
      expect(getClosingBracket(content, "{", "}", 12)).toBe(24)
    })

    it("Should handle difference types of brackets", () => {
      const content = "Some (text) with brackets"
      expect(getClosingBracket(content, "(", ")", 4)).toBe(10)
    })
  })

  describe("splitArgumentsString", () => {
    it("Should split arguments separated by commas", () => {
      const content = "arg1, arg2, arg3, arg4"
      expect(splitArgumentsString(content)).toEqual(["arg1", "arg2", "arg3", "arg4"])
    })

    it("Should handle arguments with spaces", () => {
      const content = "arg1,   arg2 , arg3  ,   arg4  "
      expect(splitArgumentsString(content)).toEqual(["arg1", "arg2", "arg3", "arg4"])
    })

    it("Should handle arguments inside parentheses", () => {
      const content = "arg1, (arg2, arg3), arg4"
      expect(splitArgumentsString(content)).toEqual(["arg1", "(arg2, arg3)", "arg4"])
    })

    it("Should handle arguments inside brackets", () => {
      const content = "arg1, [arg2, arg3], arg4"
      expect(splitArgumentsString(content)).toEqual(["arg1", "[arg2, arg3]", "arg4"])
    })

    it("Should handle arguments inside curly braces", () => {
      const content = "arg1, {arg2, arg3}, arg4"
      expect(splitArgumentsString(content)).toEqual(["arg1", "{arg2, arg3}", "arg4"])
    })

    it("Should handle escaped characters", () => {
      const content = "arg1, arg2\\,arg3, arg4"
      expect(splitArgumentsString(content)).toEqual(["arg1", "arg2\\,arg3", "arg4"])
    })

    it("Should return an array with the original content when no comma is present", () => {
      const content = "singleArgument"
      expect(splitArgumentsString(content)).toEqual(["singleArgument"])
    })
  })

  describe("getSettings", () => {
    it("Should return the start and end indexes of settings", () => {
      const value = "settings { Some words }"
      expect(getSettings(value)).toEqual([0, value.length])
    })

    it("Should handle nested brackets in settings", () => {
      const value = "settings { nested { brackets } }"
      expect(getSettings(value)).toEqual([0, value.length])
    })

    it("Should return empty array if no settings are found", () => {
      const value = "Nothing here"
      expect(getSettings(value)).toEqual([])
    })
  })

  describe("replaceBetween", () => {
    it("Should replace the characters between the given indexes", () => {
      expect(replaceBetween("Hello, world!", "everyone", 7, 12)).toEqual("Hello, everyone!")
    })

    it("Should handle replacing characters at the beginning of the string", () => {
      expect(replaceBetween("Hello, world!", "Goodbye", 0, 5)).toEqual("Goodbye, world!")
    })

    it("Should handle replacing characters at the end of the string", () => {
      expect(replaceBetween("Hello, world!", "planet", 7, 12)).toEqual("Hello, planet!")
    })

    it("Should handle replacing characters with an empty string", () => {
      expect(replaceBetween("Hello, world!", "", 5, 12)).toEqual("Hello!")
    })
  })

  describe("getPhraseEnd", () => {
    it("Should return the end position of the expected phrase", () => {
      expect(getPhraseEnd("Some Action(Some Value)", 0)).toEqual(10)
    })

    it("Should handle phrases in reverse direction", () => {
      expect(getPhraseEnd("Some Action(Some Value)", 10, -1)).toEqual(0)
    })

    it("Should handle values in parenthesis", () => {
      expect(getPhraseEnd("Some Parent Action(Some Action(Some Value))", 19)).toEqual(29)
    })

    it("Should handle values in parenthesis in reverse direction", () => {
      expect(getPhraseEnd("Some Parent Action(Some Action(Some Value))", 25, -1)).toEqual(19)
    })

    it("should handle phrases with hyphens", () => {
      expect(getPhraseEnd("Some-Action(Some Value)", 0)).toEqual(10)
    })
  })

  describe("getPhraseFromPosition", () => {
    it("Should return the start, end, and text of the phrase around the specified position", () => {
      expect(getPhraseFromPosition({ text: "Some Action", from: 5 }, 10)).toEqual({
        start: 0,
        end: 10,
        text: "Some Action"
      })
    })

    it("Should return the start, end, and text of the phrase between parenthesis", () => {
      expect(getPhraseFromPosition({ text: "Some Action(Some Value)", from: 0 }, 15)).toEqual({
        start: 12,
        end: 21,
        text: "Some Value"
      })
    })
  })
})

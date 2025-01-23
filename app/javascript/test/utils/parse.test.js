import { getClosingBracket, getPhraseEnd, getPhraseFromPosition, getSettings, removeSurroundingParenthesis, replaceBetween, splitArgumentsString, getCommasIndexesOutsideQuotes, inConfigType, isInValue } from "@utils/parse"
import { describe, it, expect } from "vitest"

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

  describe("removeSurroundingParenthesis", () => {
    it("Should remove surrounding parentheses when present", () => {
      expect(removeSurroundingParenthesis("(Test)")).toBe("Test")
    })

    it("should remove only the outermost pair of surrounding parentheses", () => {
      expect(removeSurroundingParenthesis("((Test), word)")).toBe("(Test), word")
    })
  })

  describe("getCommasIndexOutsideQoutes", () => {
    it("Should return the indexes of commas in a string that are not without qoutes", () => {
      expect(getCommasIndexesOutsideQuotes("1, 2, \"3, 4\", 5, 6")).toEqual([1, 4, 12, 15])
    })

    it("Should return an empty array if no valid commas are found", () => {
      expect(getCommasIndexesOutsideQuotes("1 2 3 4 5")).toEqual([])
    })

    it("Should return an empty array no input was given", () => {
      expect(getCommasIndexesOutsideQuotes("")).toEqual([])
    })
  })

  describe("inConfigType", () => {
    it("Should return relevant config type when position is inside", () => {
      const input = "event { some event } actions { some action } conditions { some condition }"

      expect(inConfigType(input, 10)).toBe("event")
      expect(inConfigType(input, 30)).toBe("actions")
      expect(inConfigType(input, 60)).toBe("conditions")
    })

    it("Should return relevant config type regardless of white space", () => {
      const input = `event
      {
        some event }

      actions { some action }

      conditions
        { some condition }`

      expect(inConfigType(input, 25)).toBe("event")
      expect(inConfigType(input, 55)).toBe("actions")
      expect(inConfigType(input, 95)).toBe("conditions")
    })

    it("Should return null when no relevant phrases are given", () => {
      expect(inConfigType("Some phrase", 5)).toBe(null)
      expect(inConfigType("Hey", 2)).toBe(null)
      expect(inConfigType("actions", 3)).toBe(null)
    })

    it("Should return null when start index is out of range", () => {
      expect(inConfigType("actions { }", 50)).toBe(null)
      expect(inConfigType("actions { }", -1)).toBe(null)
      expect(inConfigType("actions { }", 0)).toBe(null)
    })
  })

  describe("isInValue", () => {
    it("Should return true if position is inside of parenthesis", () => {
      const input = "Some Action(Some Value) Some Second Action(Some Value)"

      expect(isInValue(input, 15)).toBe(true)
      expect(isInValue(input, 45)).toBe(true)
    })

    it("Should return false if position is not inside of parenthesis", () => {
      const input = "Some Action(Some Value) Some Second Action(Some Value)"

      expect(isInValue(input, 5)).toBe(false)
      expect(isInValue(input, 35)).toBe(false)
    })

    it("Should return false if position is outside of range", () => {
      const input = "Some Action(Some Value) Some Second Action(Some Value)"

      expect(isInValue(input, -5)).toBe(false)
      expect(isInValue(input, 100)).toBe(false)
    })

    it("Should return true if inside of theoretical value, even if it's not closed", () => {
      const input = "Some Action(Some Value"

      expect(isInValue(input, 15)).toBe(true)
    })

    it("Should return true if entire input is in parenthesis", () => {
      const input = "(Some Value)"

      expect(isInValue(input, 5)).toBe(true)
    })

    it("Should handle nested values at any position", () => {
      const input = "Some Action(Some Action(Some Action(Some Value)))"

      for (let i = 12; i < input.length; i++) {
        expect(isInValue(input, i)).toBe(true)
      }
    })
  })
})

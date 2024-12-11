import { getFirstParameterObject, replaceParameterObject, evaluateParameterObjects, parseParameterObjectContent, directlyInsideParameterObject } from "@utils/compiler/parameterObjects"
import { completionsMap } from "@stores/editor"
import { describe, it, expect, beforeEach } from "vitest"

describe("parameterObjects.js", () => {
  beforeEach(() => {
    completionsMap.set([{
      label: "Some Action",
      args_length: 3,
      parameter_keys: ["One", "Two", "Three"],
      parameter_defaults: [0, 0, 0]
    }, {
      label: "Some Second Action",
      args_length: 4,
      parameter_keys: ["First", "Second", "Third", "Fourth"],
      parameter_defaults: ["A", "B", "C", "D"]
    }])
  })

  describe("getFirstParameterObject", () => {
    it("Should return null for content without a parameter object", () => {
      const content = "Some Action(Some Value)"
      expect(getFirstParameterObject(content)).toBeNull()
    })

    it("Should return correct parameter object with defaults for a valid content", () => {
      const content = "Some Action({ One: 10, Three: 20 })"
      const expected = {
        start: 12,
        end: 33,
        given: { One: "10", Three: "20" },
        givenKeys: ["One", "Three"],
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(getFirstParameterObject(content)).toEqual(expected)
    })

    it("Should return empty values when phrase is not found", () => {
      const content = "Some Other Action({ One: 10, Three: 20 })"
      const expected = {
        start: 18,
        end: 39,
        given: { One: "10", Three: "20" },
        givenKeys: ["One", "Three"],
        phraseParameters: [],
        phraseDefaults: [],
        phraseTypes: []
      }

      expect(getFirstParameterObject(content)).toEqual(expected)
    })

    it("Should handle white space as expected", () => {
      const expected = {
        given: { One: "10", Three: "20" },
        givenKeys: ["One", "Three"],
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(getFirstParameterObject("Some Action   ({ One: 10, Three: 20 })")).toEqual({ ...expected, start: 15, end: 36 })
      expect(getFirstParameterObject("Some Action(   { One: 10, Three: 20 }   )")).toEqual({ ...expected, start: 15, end: 36 })
      expect(getFirstParameterObject("Some Action({ One: 10,    Three: 20 })")).toEqual({ ...expected, start: 12, end: 36 })
      expect(getFirstParameterObject("Some Action({ One    :10,    Three :     20 })")).toEqual({ ...expected, start: 12, end: 44 })
      expect(getFirstParameterObject(`Some Action(
        {
          One: 10, Three: 20
        }
      )`)).toEqual({ ...expected, start: 21, end: 60 })
    })

    it("Should skip results when startFromIndex is given", () => {
      const content = "Some Action({ One: 10, Three: 20 }); Some Action({ Two: 2 })"
      const expected = {
        start: 49,
        end: 58,
        given: { Two: "2" },
        givenKeys: ["Two"],
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(getFirstParameterObject(content, 20)).toEqual(expected)
    })

    it("Should ignore [linemarker]s", () => {
      const content = "[linemarker]itemID|1[/linemarker]Some Action({\n[linemarker]itemID|2[/linemarker]\tOne: 10,\n[linemarker]itemID|3[/linemarker]\tThree: 20,\n[linemarker]itemID|4[/linemarker]})"
      const expected = {
        start: 45,
        end: 168,
        given: { One: "10", Three: "20" },
        givenKeys: ["One", "Three"],
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(getFirstParameterObject(content)).toEqual(expected)
    })

    it("Should keep duplicated keys in givenKeys array and keep the last given value", () => {
      const content = "Some Action({ One: 10, Three: 20, Three: 30 })"
      const expected = {
        start: 12,
        end: 44,
        given: { One: "10", Three: "30" },
        givenKeys: ["One", "Three", "Three"],
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(getFirstParameterObject(content)).toEqual(expected)
    })
  })

  describe("parseParameterObjectContent", () => {
    it("Should convert the string contents of a parameter object into a JS object", () => {
      const content = "One:    10,\n\tThree: 20    ,\n"
      const expected = {
        One: "10",
        Three: "20"
      }

      expect(parseParameterObjectContent(content).result).toEqual(expected)
    })

    it("Should ignore [linemarker]s", () => {
      const content = "[linemarker]itemID|1[/linemarker]\tOne: 10,\n[linemarker]itemID|2[/linemarker]\tThree: 20,\n[linemarker]itemID|3[/linemarker]"
      const expected = {
        One: "10",
        Three: "20"
      }

      expect(parseParameterObjectContent(content).result).toEqual(expected)
    })
  })

  describe("replaceParameterObject", () => {
    it("Should replace parameter object with given and default values", () => {
      const content = "Some Action({ One: 10, Three: 20 })"
      const parameterObject = {
        start: 12,
        end: 33,
        given: { One: "10", Three: "20" },
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(replaceParameterObject(content, parameterObject)).toBe("Some Action(10, 0, 20)")
    })

    it("Should use phraseDefaults if given values are not found", () => {
      const content = "Some Action({ Four: 10, Five: 20 })"
      const parameterObject = {
        start: 12,
        end: 33,
        given: { Four: "10", Five: "20" },
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(replaceParameterObject(content, parameterObject)).toBe("Some Action(0, 0, 0)")
    })

    it("Should return input if end is larger than content length", () => {
      const content = "Short"
      const parameterObject = {
        start: 1,
        end: 50,
        given: { One: "10", Three: "20" },
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(replaceParameterObject(content, parameterObject)).toBe("Short")
    })
  })

  describe("evaluateParameterObjects", () => {
    it("Should replace multiple parameter objects", () => {
      const input = `
        Some Action({ Two: 20 })
        Some Second Action({ First: Some Value, Fourth: Some Other Value })
        Some Action({ Three: 20 })
      `
      const expected = `
        Some Action(0, 20, 0)
        Some Second Action(Some Value, B, C, Some Other Value)
        Some Action(0, 0, 20)
      `

      expect(evaluateParameterObjects(input)).toBe(expected)
    })

    it("Should handle nested parameter objects", () => {
      const input = "Some Action({ Two: Some Second Action({ First: Some Value, Fourth: Some Action({ One: 5 }) }) })"
      const expected = "Some Action(0, Some Second Action(Some Value, B, C, Some Action(5, 0, 0)), 0)"

      expect(evaluateParameterObjects(input)).toBe(expected)
    })

    it("Should handle nested parameter objects on multiple lines", () => {
      const input = `
        Some Action({
          One: Some Second Action({ First: Some Value }),
          Two: Some Second Action({
            Second: Some Second Value
          })
        })
      `
      const expected = `
        Some Action(Some Second Action(Some Value, B, C, D), Some Second Action(A, Some Second Value, C, D), 0)
      `

      expect(evaluateParameterObjects(input)).toBe(expected)
    })

    it("Should leave non existing phrases intact", () => {
      const input = `
        Some Action({ One: ABC, Two: DEF })
        Some False Action({ Test: Value })
        Some Action({ One: 1, Two: 2 })
      `
      const expected = `
        Some Action(ABC, DEF, 0)
        Some False Action({ Test: Value })
        Some Action(1, 2, 0)
      `

      expect(evaluateParameterObjects(input)).toBe(expected)
    })
  })

  describe("directlyInsideParameterObject", () => {
    it("Should return parameter object only when cursor is inside", () => {
      const input = "Some Action({ Key: Value })"

      expect(directlyInsideParameterObject(input, 13)).toBeTruthy()
      expect(directlyInsideParameterObject(input, 17)).toBeTruthy()
      expect(directlyInsideParameterObject(input, 5)).toBe(null)
      expect(directlyInsideParameterObject(input, input.length)).toBe(null)
    })

    it("Should not return parameter object when cursor is in value", () => {
      const input = "Some Action({ Key: Value })"

      expect(directlyInsideParameterObject(input, 20)).toBe(null)
      expect(directlyInsideParameterObject(input, 25)).toBe(null)
    })

    it("Should return correct parameter object when nested", () => {
      const input = `Some Action({
        One: Some Second Action({ First: Some Value }),
      })`

      expect(directlyInsideParameterObject(input, 14).phraseDefaults).toEqual([0, 0, 0])
      expect(directlyInsideParameterObject(input, 48).phraseDefaults).toEqual(["A", "B", "C", "D"])
      expect(directlyInsideParameterObject(input, 70).phraseDefaults).toEqual([0, 0, 0])
    })

    it("Should return null when no parameter object was given", () => {
      const input = "Some Action()"

      for(let i = 0; i < input.length; i++) {
        expect(directlyInsideParameterObject(input, i)).toBe(null)
      }
    })

    it("Should return null when no content was given", () => {
      const input = ""

      expect(directlyInsideParameterObject(input, 0)).toBe(null)
    })

    it("Should return null when index was out of range of string was given", () => {
      const input = "Some Action({})"

      expect(directlyInsideParameterObject(input, 30)).toBe(null)
      expect(directlyInsideParameterObject(input, -1)).toBe(null)
    })

    it("Should return null parameter key was not finished properly and cursor is after object", () => {
      const input = "Some Action({ One }); Two"

      expect(directlyInsideParameterObject(input, 20)).toBe(null)
    })
  })
})

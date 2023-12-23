import { getFirstParameterObject, replaceParameterObject, evaluateParameterObjects } from "../../../../app/javascript/src/utils/compiler/parameterObjects"
import { completionsMap } from "../../../../app/javascript/src/stores/editor"
import { disregardWhitespace } from "../../helpers/text"

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
    test("Should return null for content without a parameter object", () => {
      const content = "Some Action(Some Value)"
      expect(getFirstParameterObject(content)).toBeNull()
    })

    test("Should return correct parameter object with defaults for a valid content", () => {
      const content = "Some Action({ One: 10, Three: 20 })"
      const expected = {
        start: 12,
        end: 33,
        given: { One: "10", Three: "20" },
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(getFirstParameterObject(content)).toEqual(expected)
    })

    test("Should return empty values when phrase is not found", () => {
      const content = "Some Other Action({ One: 10, Three: 20 })"
      const expected = {
        start: 18,
        end: 39,
        given: { One: "10", Three: "20" },
        phraseParameters: [],
        phraseDefaults: []
      }

      expect(getFirstParameterObject(content)).toEqual(expected)
    })

    test("Should handle white space as expected", () => {
      const expected = {
        given: { One: "10", Three: "20" },
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

    test("Should skip results when startFromIndex is given", () => {
      const content = "Some Action({ One: 10, Three: 20 }); Some Action({ Two: 2 })"
      const expected = {
        start: 49,
        end: 58,
        given: { Two: "2" },
        phraseParameters: ["One", "Two", "Three"],
        phraseDefaults: [0, 0, 0]
      }

      expect(getFirstParameterObject(content, 20)).toEqual(expected)
    })
  })

  describe("replaceParameterObject", () => {
    test("Should replace parameter object with given and default values", () => {
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

    test("Should use phraseDefaults if given values are not found", () => {
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

    test("Should return input if end is larger than content length", () => {
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
    test("Should replace multiple parameter objects", () => {
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

    test("Should handle nested parameter objects", () => {
      const input = "Some Action({ Two: Some Second Action({ First: Some Value, Fourth: Some Action({ One: 5 }) }) })"
      const expected = "Some Action(0, Some Second Action(Some Value, B, C, Some Action(5, 0, 0)), 0)"

      expect(evaluateParameterObjects(input)).toBe(expected)
    })

    test("Should handle nested parameter objects on multiple lines", () => {
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

    test("Should leave non existing phrases intact", () => {
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
})

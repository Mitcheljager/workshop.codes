import { getFirstParameterObject } from "../../../../app/javascript/src/utils/compiler/parameterObjects"
import { completionsMap } from "../../../../app/javascript/src/stores/editor"
import { disregardWhitespace } from "../../helpers/text"

describe("parameterObjects.js", () => {
  beforeEach(() => {
    completionsMap.set([{
      label: "Some Action",
      args_length: 3,
      detail_full: "One, Two, Three",
      parameter_defaults: [
        0,
        0,
        0
      ]
    }])
  })

  describe("getFirstParameterObject", () => {
    test("Should return null for content without a parameter object", () => {
      const content = "Some Action(Some Value)"
      expect(getFirstParameterObject(content)).toBeNull()
    })
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
  })
})

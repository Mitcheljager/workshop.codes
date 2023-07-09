import { evaluateEachLoops, parseArrayValues } from "../../../../app/javascript/src/utils/compiler/each"
import { workshopConstants } from "../../../../app/javascript/src/stores/editor"
import { disregardWhitespace } from "../../helpers/text"

describe("for.js", () => {
  afterEach(() => {
    workshopConstants.set({})
  })

  describe("evaluateEachLoops", () => {
    test("Should evaluate a simple each loop", () => {
      const input = `@each (thing in [one, two, three]) {
        Each.thing;
      }`
      const expectedOutput = `
        one;
        two;
        three;
      `
      expect(disregardWhitespace(evaluateEachLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should include iterator by default", () => {
      const input = `@each (thing in [one, two, three]) {
        Each.thing = Each.i;
      }`
      const expectedOutput = `
        one = 0;
        two = 1;
        three = 2;
      `
      expect(disregardWhitespace(evaluateEachLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should be able to rename iterator", () => {
      const input = `@each (thing, j in [one, two, three]) {
        Each.thing = Each.j;
      }`
      const expectedOutput = `
        one = 0;
        two = 1;
        three = 2;
      `
      expect(disregardWhitespace(evaluateEachLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should be able use constants from store as arrays", () => {
      workshopConstants.set({ Test: { One: { "en-US": "one" }, Two: { "en-US": "two" }, Three: { "en-US": "three" }}})
      const input = `@each (thing in Constant.Test) {
        Each.thing;
      }`
      const expectedOutput = `
        one;
        two;
        three;
      `
      expect(disregardWhitespace(evaluateEachLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })

  describe("parseArrayValues", () => {
    it("Should parse array values correctly", () => {
      const input = "1, 2, 3"
      const expected = ["1", "2", "3"]
      expect(parseArrayValues(input)).toEqual(expected)
    })

    it("Should skip values in parenthesis", () => {
      const input = "1, (2, 3), 4"
      const expected = ["1", "(2, 3)", "4"]
      expect(parseArrayValues(input)).toEqual(expected)
    })

    it("Should skip values in brackets", () => {
      const input = "1, [2, 3], 4"
      const expected = ["1", "[2, 3]", "4"]
      expect(parseArrayValues(input)).toEqual(expected)
    })

    it("Should skip values in parenthesis and brackets", () => {
      const input = "1, (2, [3, 4]), 5"
      const expected = ["1", "(2, [3, 4])", "5"]
      expect(parseArrayValues(input)).toEqual(expected)
    })
  })
})

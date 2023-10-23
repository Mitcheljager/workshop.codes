import { evaluateForLoops } from "../../../../app/javascript/src/utils/compiler/for"
import { disregardWhitespace } from "../../helpers/text"

describe("for.js", () => {
  describe("evaluateForLoops", () => {
    test("Should evaluate a simple for loop", () => {
      const input = `@for (1 to 3) {
        Test;
      }`
      const expectedOutput = `
        Test;
        Test;
      `
      expect(disregardWhitespace(evaluateForLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should include final number when using through", () => {
      const input = `@for (1 through 3) {
        Test;
      }`
      const expectedOutput = `
        Test;
        Test;
        Test;
      `
      expect(disregardWhitespace(evaluateForLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should evaluate variable in for loop", () => {
      const input = `@for (1 to 3) {
        For.i;
      }`
      const expectedOutput = `
        1;
        2;
      `
      expect(disregardWhitespace(evaluateForLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should evaluate a for loop with custom variable name", () => {
      const input = `@for (someVar from 5 to 7) {
        For.someVar;
      }`
      const expectedOutput = `
        5;
        6;
      `
      expect(disregardWhitespace(evaluateForLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should handle nested for loops", () => {
      const input = `@for (1 through 2) {
        Test;
        @for (1 through 2) {
          Test;
        }
      }`
      const expectedOutput = `
        Test;
          Test;
          Test;
        Test;
          Test;
          Test;
      `
      expect(disregardWhitespace(evaluateForLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("should handle multiple for loops", () => {
      const input = `@for (1 through 2) {
        Test;
      }
      @for (1 through 2) {
        Test;
      }`
      const expectedOutput = `
        Test;
        Test;

        Test;
        Test;
      `
      expect(disregardWhitespace(evaluateForLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })
})

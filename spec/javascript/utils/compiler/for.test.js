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

    test("Should evaluate a for loop with a custom step size", () => {
      const input = `@for (2 through 6 in steps of 2) {
        For.i;
      }`
      const expectedOutput = `
        2;
        4;
        6;
      `
      expect(disregardWhitespace(evaluateForLoops(input))).toBe(disregardWhitespace(expectedOutput))
    })

    test("Should evaluate a for loop with from, to, and step of decimal values", () => {
      const input = `
      // Inclusive (0.5..4.2 / 1.5)
      @for (inc_lt from 0.5 through 4.2 in steps of 1.5) {
        For.inc_lt;
      }

      // Inclusive (0.5..5.0 / 1.5)
      @for (inc_eq from 0.5 through 5 in steps of 1.5) {
        For.inc_eq;
      }

      // Inclusive (0.5..5.2 / 1.5)
      @for (inc_gt from 0.5 through 5.2 in steps of 1.5) {
        For.inc_gt;
      }

      // Exclusive (0.5..4.2 / 1.5)
      @for (exc_lt from 0.5 to 4.2 in steps of 1.5) {
        For.exc_lt;
      }

      // Exclusive (0.5..5.0 / 1.5)
      @for (exc_eq from 0.5 to 5 in steps of 1.5) {
        For.exc_eq;
      }

      // Exclusive (0.5..5.2 / 1.5)
      @for (exc_gt from 0.5 to 5.2 in steps of 1.5) {
        For.exc_gt;
      }
      `
      const expectedOutput = `
        // Inclusive (0.5..4.2 / 1.5)
        0.5;  2;  3.5;  5;

        // Inclusive (0.5..5.0 / 1.5)
        0.5;  2;  3.5;  5;

        // Inclusive (0.5..5.2 / 1.5)
        0.5;  2;  3.5;  5;  6.5;

        // Exclusive (0.5..4.2 / 1.5)
        0.5;  2;  3.5;

        // Exclusive (0.5..5.0 / 1.5)
        0.5;  2;  3.5;

        // Exclusive (0.5..5.2 / 1.5)
        0.5;  2;  3.5;  5;
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

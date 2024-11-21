import { evaluateConditionals } from "@utils/compiler/conditionals"
import { disregardWhitespace } from "@test/helpers/text"
import { describe, it, expect } from "vitest"

describe("conditionals.js", () => {
  describe("evaluateConditionals", () => {
    it("Should evaluate a simple if statement", () => {
      const input = "@if (1 == 1) { Do Something(); }"
      const expectedOutput = "Do Something();"
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should not render 'if' if statement is false", () => {
      const input = `@if (1 == 2) {
        Do Something();
      }`
      const expectedOutput = ""
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should render 'else' if statement is false", () => {
      const input = `@if (1 == 2) {
        Do Something();
      } @else {
        Do Something Else();
      }`
      const expectedOutput = "Do Something Else();"
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should render 'else if' if statement is false", () => {
      const input = `@if (1 == 2) {
        Do Something();
      } @else if (1 == 1) {
        Do Something Else If();
      } @else {
        Do Something Else();
      }`
      const expectedOutput = "Do Something Else If();"
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should evaluate a negative compare", () => {
      const input = "@if (1 != 2) { Do Something(); }"
      const expectedOutput = "Do Something();"
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should evaluate an or compare", () => {
      const input = "@if (1 == 2 || 1 == 1) { Do Something(); }"
      const expectedOutput = "Do Something();"
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))
    })

    it("Should evaluate an and compare", () => {
      const input = "@if (1 == 1 && 1 == 1) { Do Something(); }"
      const expectedOutput = "Do Something();"
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))

      const input2 = "@if (1 == 1 && 1 != 1) { Do Something(); }"
      const expectedOutput2 = ""
      expect(disregardWhitespace(evaluateConditionals(input2))).toBe(disregardWhitespace(expectedOutput2))
    })

    it("Should handle nested if statements", () => {
      const input = `
        @if (1 == 1) {
          Do Something();

          @if (2 == 2) {
            Do Something();
          }
        }`
      const expectedOutput = "Do Something(); Do Something();"
      expect(disregardWhitespace(evaluateConditionals(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })
})

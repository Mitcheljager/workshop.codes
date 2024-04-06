import { removeComments } from "@utils/compiler/comments"
import { describe, it, expect } from "vitest"

describe("comments.js", () => {
  describe("removeComments", () => {
    it("Should remove block comments", () => {
      const input = "Some Action /* This is a block comment */"
      const expectedOutput = "Some Action "
      expect(removeComments(input)).toBe(expectedOutput)
    })

    it("Should remove line comments", () => {
      const input = "// This is a line comment\n    Some Action"
      const expectedOutput = "\n    Some Action"
      expect(removeComments(input)).toBe(expectedOutput)
    })

    it("Should not modify the input string if there are no comments", () => {
      const input = "rule('Some Rule') { Some Action; }"
      expect(removeComments(input)).toBe(input)
    })
  })
})

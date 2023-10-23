import { removeComments } from "../../../../app/javascript/src/utils/compiler/comments"

describe("comments.js", () => {
  describe("removeComments", () => {
    test("Should remove block comments", () => {
      const input = "Some Action /* This is a block comment */"
      const expectedOutput = "Some Action "
      expect(removeComments(input)).toBe(expectedOutput)
    })

    test("Should remove line comments", () => {
      const input = "// This is a line comment\n    Some Action"
      const expectedOutput = "\n    Some Action"
      expect(removeComments(input)).toBe(expectedOutput)
    })

    test("Should not modify the input string if there are no comments", () => {
      const input = "rule('Some Rule') { Some Action; }"
      expect(removeComments(input)).toBe(input)
    })
  })
})

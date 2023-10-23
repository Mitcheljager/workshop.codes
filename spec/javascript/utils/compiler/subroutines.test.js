import { compileSubroutines, getSubroutines } from "../../../../app/javascript/src/utils/compiler/subroutines"
import { disregardWhitespace } from "../../helpers/text"

describe("subroutines.js", () => {
  describe("getSubroutines", () => {
    test("Should extract subroutines", () => {
      const input = `
        Subroutine;
        someSubroutine1;

        Subroutine;
        someSubroutine2;
      `
      const expectedOutput = ["someSubroutine1", "someSubroutine2"]
      expect(getSubroutines(input)).toEqual(expectedOutput)
    })

    test("Should handle duplicate subroutines", () => {
      const input = `
        Subroutine;
        someSubroutine;

        Subroutine;
        someSubroutine;
      `
      const expectedOutput = ["someSubroutine"]
      expect(getSubroutines(input)).toEqual(expectedOutput)
    })
  })

  describe("compileSubroutines", () => {
    test("Should compile subroutines", () => {
      const input = `
        Subroutine;
        someSubroutine;
      `
      const expectedOutput = `
        subroutines {
          0: someSubroutine
        }\n\n
      `
      expect(disregardWhitespace(compileSubroutines(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })
})

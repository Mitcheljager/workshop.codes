import { compileSubroutines, getSubroutines } from "@utils/compiler/subroutines"
import { disregardWhitespace } from "@test/helpers/text"
import { describe, it, expect } from "vitest"

describe("subroutines.js", () => {
  describe("getSubroutines", () => {
    it("Should extract subroutines declared from rules", () => {
      const input = `
        Subroutine;
        someSubroutine1;

        Subroutine;
        someSubroutine2;
      `
      expect(getSubroutines(input)).toEqual(["someSubroutine1", "someSubroutine2"])
    })

    it("Should extract subroutines used in actions", () => {
      const input = `
        Call Subroutine(someSubroutine1);

        Start Rule(someSubroutine2, OtherParamIdk);
      `
      expect(getSubroutines(input)).toEqual(["someSubroutine1", "someSubroutine2"])
    })

    it("Should handle duplicate subroutines", () => {
      const input = `
        Subroutine;
        someSubroutine;

        Subroutine;
        someSubroutine;

        Call Subroutine(someSubroutine);

        Start Rule(someSubroutine, OtherParamIdk);
      `
      expect(getSubroutines(input)).toEqual(["someSubroutine"])
    })

    it("Should exclude linemarkers from subroutine name", () => {
      const input = `
        [linemarker][/linemarker]Subroutine;
        [linemarker][/linemarker]someSubroutine;
      `
      expect(getSubroutines(input)).toEqual(["someSubroutine"])
    })
  })

  describe("compileSubroutines", () => {
    it("Should compile subroutines", () => {
      const input = `
        Subroutine;
        someSubroutine1;

        Call Subroutine(someSubroutine2);
      `
      const expectedOutput = `
        subroutines {
          0: someSubroutine1
          1: someSubroutine2
        }\n\n
      `
      expect(disregardWhitespace(compileSubroutines(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })
})

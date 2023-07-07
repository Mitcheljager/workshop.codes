import { compileVariables, getVariables } from "../../../../app/javascript/src/utils/compiler/variables"
import { disregardWhitespace } from "../../helpers/text"

describe("variables.js", () => {
  describe("getVariables", () => {
    test("Should extract global variables", () => {
      const input = `
        Global.variable1 = Test;
        Global.variable2 = Test;
        For Global Variable(variable3, 0, 1) {
          // Do something
        }
      `
      const expectedOutput = {
        globalVariables: ["variable1", "variable2", "variable3"],
        playerVariables: []
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should extract player variables", () => {
      const input = `
        Event Player.variable1 = Test;
        Victim.variable2 = Test;
        Attacker.variable3 = Test;
        Healer.variable4 = Test;
        Healee.variable5 = Test;
        Local Player.variable6 = Test;
        Host Player.variable7 = Test;
        For Player Variable(Event Player, variable8, 1) {
          // Do something
        }
      `
      const expectedOutput = {
        globalVariables: [],
        playerVariables: ["variable1", "variable2", "variable3", "variable4", "variable5", "variable6", "variable7", "variable8"]
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should handle no variables present", () => {
      const input = "Just Some Action;"
      const expectedOutput = {
        globalVariables: [],
        playerVariables: []
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should handle duplicate variables", () => {
      const input = `
        Global.variable1 = 10;
        Global.variable2 = 20;
        Global.variable2 = 30;
        For Global Variable(variable1, 0, 1) {
          // Do something
        }
      `
      const expectedOutput = {
        globalVariables: ["variable1", "variable2"],
        playerVariables: []
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })
  })

  describe("compileVariables", () => {
    test("should compile global variables", () => {
      const input = `
        Global.variable1 = Test;
        Global.variable2 = Test;
        For Global Variable(variable3, 0, 1) {
          // Do something
        }

        Event Player.variable1 = Test
      `
      const expectedOutput = `
        variables {
          global:
            0: variable1
            1: variable2
            2: variable3
          player:
            0: variable1
        }\n\n
      `
      expect(disregardWhitespace(compileVariables(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })
})

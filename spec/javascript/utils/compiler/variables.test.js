import { compileVariables, getVariables } from "../../../../app/javascript/src/utils/compiler/variables"
import { disregardWhitespace } from "../../helpers/text"

describe("variables.js", () => {
  describe("getVariables", () => {
    test("Should extract global variables", () => {
      const input = `
        Global.variable1 = Test;
        Set Global Variable(variable2, Test);
        Modify Global Variable(variable3, Test);
        Set Global Variable(variable4, Test);
        Modify Global Variable(variable5, Test);
        Chase Global Variable At Rate(variable6, Test, ...);
        Chase Global Variable Over Time(variable7, Test, ...);
        For Global Variable(variable8, 0, 1) {
          // Do something
        }
      `
      const expectedOutput = {
        globalVariables: ["variable1", "variable2", "variable3", "variable4", "variable5", "variable6", "variable7", "variable8"],
        playerVariables: []
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should extract simple player variables", () => {
      const input = `
        Event Player.variable1 = Test;
        Victim.variable2 = Test;
        Attacker.variable3 = Test;
        Healer.variable4 = Test;
        Healee.variable5 = Test;
        Local Player.variable6 = Test;
        Host Player.variable7 = Test;
        Set Player Variable(Event Player, variable8, Test);
        Set Player Variable At Index(Event Player, variable9, Test);
        Modify Player Variable(Event Player, variable10, Test);
        Modify Player Variable At Index(Event Player, variable11, Test);
        Chase Player Variable At Rate(Event Player, variable12, Test, ...);
        Chase Player Variable Over Time(Event Player, variable13, Test, ...);
        For Player Variable(Event Player, variable14, 1) {
          // Do something
        }
      `
      const expectedOutput = {
        globalVariables: [],
        playerVariables: ["variable1", "variable2", "variable3", "variable4", "variable5", "variable6", "variable7", "variable8", "variable9", "variable10", "variable11", "variable12", "variable13", "variable14"]
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should handle nested player variables", () => {
      const input = `
        Event Player.variableA.variableB = Test;
        Event Player.variableA.variableB.variableC = Test;
        Event Player.variableC[0].variableD = Test;
      `
      const expectedOutput = {
        globalVariables: [],
        playerVariables: ["variableA", "variableB", "variableC", "variableD"]
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should handle player variables nested in global variables", () => {
      const input = `
        Global.variableA.variableB = Test;
        Global.variableC[0].variableD = Test;
      `
      const expectedOutput = {
        globalVariables: ["variableA", "variableC"],
        playerVariables: ["variableB", "variableD"]
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

    test("Should ignore decimals of a number", () => {
      const input = `
        1.234;
        1.abc;
      `
      const expectedOutput = {
        globalVariables: [],
        playerVariables: []
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should not ignore nested variables ending in a number", () => {
      const input = `
        Event Player.variable1.variable2;
      `
      const expectedOutput = {
        globalVariables: [],
        playerVariables: ["variable1", "variable2"]
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should ignore constants with periods", () => {
      const input = "Hero(D.Va)"
      const expectedOutput = {
        globalVariables: [],
        playerVariables: []
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should not ignore player variables that look like constants with periods", () => {
      const input = "Event Player.D.Va"
      const expectedOutput = {
        globalVariables: [],
        playerVariables: ["D", "Va"]
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
    test("Should compile variables", () => {
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

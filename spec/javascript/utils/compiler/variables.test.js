import { compileVariables, excludeDefaultVariableNames, getDefaultVariableNameIndex, getVariables } from "../../../../app/javascript/src/utils/compiler/variables"
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

    test("Global variables should only contain letters, numbers, or an underscore", () => {
      // caughtByTheGame means the variable is technically an error in-game,
      // but we leave informing users of that fact to our Linter
      const input = `
        Global.variable1;
        Global.vArIaBlE;
        Global.variable_1;
        Global.1caughtByTheGame;
        Global.variable2+5;
        Global.$notAValidVariable;
        Global.TorbTurret+Up*2;

        Set Global Variable($caughtByTheGame, whatever);
      `
      const expectedOutput = {
        globalVariables: [
          "variable1",
          "vArIaBlE",
          "variable_1",
          "1caughtByTheGame",
          "variable2",
          "TorbTurret",
          "$caughtByTheGame"
        ],
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

    test("Player variables should only contain letters, numbers, or an underscore", () => {
      // caughtByTheGame means the variable is technically an error in-game,
      // but we leave informing users of that fact to our Linter
      const input = `
        Event Player.variable1;
        Event Player.vArIaBlE;
        Event Player.variable_1;
        Event Player.1caughtByTheGame;
        Event Player.variable2+5;
        Event Player.$notAValidVariable;
        Event Player.TorbTurret+Up*2

        Set Player Variable(Event Player, $caughtByTheGame, whatever);
      `
      const expectedOutput = {
        globalVariables: [],
        playerVariables: [
          "variable1",
          "vArIaBlE",
          "variable_1",
          "1caughtByTheGame",
          "variable2",
          "TorbTurret",
          "$caughtByTheGame"
        ]
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
        .1234;
        Wait(.1234);
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

    test("Should ignore variable-likes inside strings", () => {
      const input = "Custom String(\"Hello.World I8.5.3\")"
      const expectedOutput = {
        globalVariables: [],
        playerVariables: []
      }
      expect(getVariables(input)).toEqual(expectedOutput)
    })

    test("Should ignore variable-likes when there is a symbol behind them", () => {
      const input = "Wait(.15)"
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

    test("Should exclude default variables if their index is different from the default", () => {
      const input = `
        Global.variable;
        Global.A;
        Global.DX;
        Global.DY;
        Global.ZZ;

        Event Player.variable;
        Event Player.A;
        Event Player.DX;
        Event Player.DY;
        Event Player.ZZ;
      `
      const expectedOutput = `
        variables {
          global:
            0: variable
            1: A
            2: DY
            3: ZZ
          player:
            0: variable
            1: A
            2: DY
            3: ZZ
        }\n\n
      `
      expect(disregardWhitespace(compileVariables(input))).toBe(disregardWhitespace(expectedOutput))
    })
  })

  describe("excludeDefaultVariableNames", () => {
    test("Should exclude single letter variables if their index is different from the default", () => {
      const input = [
        "A",
        "variable",
        "Z",
        "B"
      ]
      const expectedOutput = [
        "A",
        "variable",
        "B"
      ]
      expect(excludeDefaultVariableNames(input)).toStrictEqual(expectedOutput)
    })

    test("Should exclude double letter variables if their index is different from the default", () => {
      const input = [
        ... (new Array(100).fill("ignore me")),
        "DW",
        "DX",
        "DY",
        "DZ",
        "ZZ"
      ]
      const expectedOutput = [
        ... (new Array(100).fill("ignore me")),
        "DY",
        "DZ",
        "ZZ"
      ]
      expect(excludeDefaultVariableNames(input)).toStrictEqual(expectedOutput)
    })
  })

  describe("getDefaultVariableNameIndex", () => {
    test("Should give a correct value for A and Z", () => {
      const expectedOutput = {
        "A": 0,
        "B": 1,
        "Y": 24,
        "Z": 25
      }

      expect(
        Object.fromEntries(Object.keys(expectedOutput).map((name) => [name, getDefaultVariableNameIndex(name)]))
      ).toStrictEqual(expectedOutput)
    })

    test("Should give a correct value for AA and ZZ", () => {
      const expectedOutput = {
        "AA": 26,
        "DX": 127,
        "DY": 128,
        "ZZ": 701
      }

      expect(
        Object.fromEntries(Object.keys(expectedOutput)
          .map((name) => [name, getDefaultVariableNameIndex(name)]))
      ).toStrictEqual(expectedOutput)
    })
  })
})

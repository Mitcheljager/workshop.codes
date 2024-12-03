import { parseCustomGameSettingsStringToObject } from "@utils/customGameSettings"
import { describe, it, expect } from "vitest"

describe("customGameSettings.js", () => {
  describe("parseCustomGameSettingsStringToObject", () => {
    it("Should parse string to object", () => {
      expect(parseCustomGameSettingsStringToObject(`
        settings
        {
          main
          {
            Some Key: Some Value
            Some Other Key: Some Other Value
          }

          modes
          {
            General
            {
              Some Third Key: Some Third Value
            }

            Other
            {
              Some Fourth Key: Some Fourth Value
            }
          }
        }
      `)).toEqual({
        main: {
          "Some Key": "Some Value",
          "Some Other Key": "Some Other Value"
        },
        modes: {
          General: {
            "Some Third Key": "Some Third Value"
          },
          Other: {
            "Some Fourth Key": "Some Fourth Value"
          }
        }
      })
    })

    it("Should handle array like lists", () => {
      expect(parseCustomGameSettingsStringToObject(`
        settings
        {
          modes
          {
            Practice Range
            Skirmish
            Deathmatch {

            }
            Team Deathmatch {
              Some Key: Some Value
            }
          }
        }
      `)).toEqual({
        settings: {
          modes: {
            "Practice Range": "",
            Skirmish: "",
            Deathmatch: {},
            "Team Deathmatch": {
              "Some Key": "Some Value"
            }
          }
        }
      })
    })
  })
})

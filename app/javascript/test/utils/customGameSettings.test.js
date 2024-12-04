import { parseCustomGameSettingsStringToObject, settingsObjectToCustomGameSettingsFormat } from "@utils/customGameSettings"
import { customGameSettings } from "@stores/editor"
import { describe, it, expect, beforeEach } from "vitest"

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
        settings: {
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

  describe("settingsObjectToCustomGameSettingsFormat", () => {
    beforeEach(() => {
      customGameSettings.set({
        lobby: {
          values: {
            General: {
              values: {
                "Some Key With Array": {
                  default: "Value One",
                  values: [
                    "Value One",
                    "Value Two",
                    "Value Three"
                  ]
                },
                "Some Range": {
                  values: "range",
                  min: 0,
                  max: 10,
                  default: 5
                },
                "Some String": {
                  values: "string",
                  default: "Hey"
                }
              }
            },
            "Not General": {
              values: {
                "Some String": {
                  default: "Some default value"
                }
              }
            }
          }
        }
      })
    })

    it("Should add values given in object to return value", () => {
      const input = {
        settings: {
          lobby: {
            General: {
              "Some Key With Array": {
                "First Value": "",
                "Second Value": ""
              },
              "Some Range": 2
            },
            "Not General": {
              "Some String": "Some Value"
            }
          }
        }
      }

      expect(settingsObjectToCustomGameSettingsFormat(input)).toEqual({
        lobby: {
          values: {
            General: {
              values: {
                "Some Key With Array": {
                  current: [
                    "First Value",
                    "Second Value"
                  ],
                  default: "Value One",
                  values: [
                    "Value One",
                    "Value Two",
                    "Value Three"
                  ]
                },
                "Some Range": {
                  values: "range",
                  min: 0,
                  max: 10,
                  default: 5,
                  current: 2
                },
                "Some String": {
                  values: "string",
                  default: "Hey"
                }
              }
            },
            "Not General": {
              values: {
                "Some String": {
                  default: "Some default value",
                  current: "Some Value"
                }
              }
            }
          }
        }
      })
    })
  })
})

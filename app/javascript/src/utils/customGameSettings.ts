import { get } from "svelte/store"
import { customGameSettings, heroes } from "@stores/editor"

/**
 * Construct settings object from the customGameSettings store. Most options are one to one with the store, but some keys are build out from other values.
 * For instance, hero settings have both individual settings are settings that are inserted per hero.
 */
export function constructCustomGameSettings(): object {
  const settings: any = { ...get(customGameSettings) }
  const settingsHeroes = settings.heroes?.values || []

  get(heroes).forEach(({ name }: { name: string }) => {
    if (!(name in settingsHeroes)) return

    Object.entries(settingsHeroes.General.values).forEach(([key, item]: [key: string, item: any]) => {
      if (item.include?.includes(name) || !item.include) settingsHeroes[name].values[key] = item
    })

    settingsHeroes.each.forEach((item: any) => {
      const key = item.keys?.[name]
      if (key) settingsHeroes[name].values[key] = item
    })
  })

  return settings
}

/**
 * Parse a Workshop settings string to a javascript object.
 */
export function parseCustomGameSettingsStringToObject(input: string): object {
  input = input.replaceAll(/\s*{/g, " {") // Move opening { to the same line if it's on the next line

  const lines = input.split("\n").map(line => line.trim())
  const result = {}
  const keyChain = []

  let currentObject: any = result

  for (let index = 0; index < lines.length; index++) {
    const currentLine = lines[index]
    const isOpening = currentLine.indexOf("{") !== -1
    const isClosing = currentLine.indexOf("}") !== -1

    // Does not yet account for "Ultimate Ability Configuration: Artillery: Off" and such.
    let [key, value] = currentLine.split(/[:{}](.*)/s)
    key = key?.trim() || ""
    value = value?.trim() || ""

    if (isOpening) keyChain.push(key)
    else if (isClosing) keyChain.pop()

    if (key && isOpening) { // Is a object, for instance "modes {"
      currentObject[key] = {}
      currentObject = currentObject[key]
    } else if (key && !isOpening) { // Is a value and not a new object, for instance "Ultimate Generation: 100%"
      currentObject[key] = value
    } else if (isClosing) { // Is a closing character "}", moving back up 1 key in the chain
      currentObject = result
      keyChain.forEach((key) => currentObject = currentObject[key])
    }
  }

  return result
}

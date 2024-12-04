import { get } from "svelte/store"
import { customGameSettings, heroes } from "@stores/editor"

/** Construct settings object from the customGameSettings store. Most options are one to one with the store, but some keys are build out from other values.
 * For instance, hero settings have both individual settings are settings that are inserted per hero. */
export function constructCustomGameSettings(): object {
  const settings: any = { ...get(customGameSettings) }
  const settingsHeroes = settings.heroes?.values || []

  // This only happens during HMR
  if (!("each" in settingsHeroes)) return settings

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

  if ("each" in settingsHeroes) delete settingsHeroes.each

  return settings
}

/** Parse a Workshop settings string to a javascript object.*/
export function parseCustomGameSettingsStringToObject(input: string): object {
  if (!input) return {}

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

/** Transform a settings object as returned from `parseCustomGameSettingsString` to that as returned from `constructCustomGameSettings` */
export function settingsObjectToCustomGameSettingsFormat(input: any): object {
  // This is set to { values: {} } rather than top level to keep subsequent checks simpler. Iterations check for the
  // values key and by including it here we don't need to make an exception just for this top level value.
  const settings = { values: constructCustomGameSettings() }
  const keyChain: string[] = ["settings"]

  // Iterate over all keys in settings, ignore "values", and match keys in input.
  // All keys are iterated over even if they are not present in the input.
  // This is a but wasteful, but doing it the other way around broke my brain.
  iterate(settings)

  function iterate(item: any): void {
    // If a key is not an object it is a value set in the settings, for instance "Ultimate Generation: 100%"
    // This value is inserted as the `current` value, which is used by various inputs.
    if (typeof item.values !== "object" || Array.isArray(item.values)) {
      let valueInInput = keyChain.reduce((current, key) => current && current[key], input)

      // If a value is in the settings object but not in the input it is returned as `undefined`
      // This means no value is given and it can be ignored.
      const isValid = typeof valueInInput != "undefined"

      const isEqualToDefault = JSON.stringify(item.default) === JSON.stringify(valueInInput)

      if (isValid && Array.isArray(item.values)) valueInInput = Object.keys(valueInInput)
      if (isValid && !isEqualToDefault) item.current = valueInInput

      keyChain.pop()
      return
    }

    Object.entries(item.values).forEach(([key, value]) => {
      if (!key || !value) return
      if (key !== "values" && typeof value === "object" && !Array.isArray(value)) {
        // A given value is an object and not a direct setting, we go 1 level deeper into the object
        keyChain.push(key)
      }

      iterate(value)
    })

    // We've gone through all keys in an object and can pop the last key in the chain before moving on to the next object
    keyChain.pop()
  }

  return settings.values
}

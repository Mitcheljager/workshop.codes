import { templates } from "../../lib/templates"
import { getSettings } from "../parse"
import { flatItems } from "../../stores/editor"
import { removeComments } from "./comments"
import { evaluateConditionals } from "./conditionals"
import { evaluateEachLoops } from "./each"
import { evaluateForLoops } from "./for"
import { extractAndInsertMixins } from "./mixins"
import { compileSubroutines } from "./subroutines"
import { convertTranslations } from "./translations"
import { compileVariables } from "./variables"
import { get } from "svelte/store"

export function compile(overwriteContent = null) {
  let joinedItems = overwriteContent || get(flatItems)

  joinedItems = removeComments(joinedItems)

  const [settingsStart, settingsEnd] = getSettings(joinedItems)
  let settings = joinedItems.slice(settingsStart, settingsEnd)

  if (!settings || !settingsEnd) settings = templates.Settings

  joinedItems = joinedItems.replace(settings, "")
  joinedItems = extractAndInsertMixins(joinedItems)
  joinedItems = evaluateForLoops(joinedItems)
  joinedItems = evaluateEachLoops(joinedItems)
  joinedItems = evaluateConditionals(joinedItems)
  joinedItems = convertTranslations(joinedItems)

  const variables = compileVariables(joinedItems)
  const subroutines = compileSubroutines(joinedItems)

  return settings + variables + subroutines + joinedItems
}

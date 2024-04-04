import { templates } from "../../lib/templates"
import { getSettings } from "../parse"
import { flatItems } from "../../stores/editor"
import { removeComments } from "@src/comments"
import { evaluateConditionals } from "@src/conditionals"
import { evaluateEachLoops } from "@src/each"
import { evaluateForLoops } from "@src/for"
import { evaluateParameterObjects } from "@src/parameterObjects"
import { extractAndInsertMixins } from "@src/mixins"
import { compileSubroutines } from "@src/subroutines"
import { convertTranslations } from "@src/translations"
import { compileVariables } from "@src/variables"
import { get } from "svelte/store"

export function compile(overwriteContent = null) {
  let joinedItems = overwriteContent || get(flatItems)

  joinedItems = removeComments(joinedItems)

  const [settingsStart, settingsEnd] = getSettings(joinedItems)
  let settings = joinedItems.slice(settingsStart, settingsEnd)

  if (!settings || !settingsEnd) settings = templates.Settings

  joinedItems = joinedItems.replace(settings, "")
  joinedItems = extractAndInsertMixins(joinedItems)
  joinedItems = evaluateParameterObjects(joinedItems)
  joinedItems = evaluateForLoops(joinedItems)
  joinedItems = evaluateEachLoops(joinedItems)
  joinedItems = evaluateConditionals(joinedItems)
  joinedItems = convertTranslations(joinedItems)

  const variables = compileVariables(joinedItems)
  const subroutines = compileSubroutines(joinedItems)

  return settings + variables + subroutines + joinedItems
}

import { templates } from "@lib/templates"
import { getSettings } from "@utils/parse"
import { flatItems } from "@stores/editor"
import { removeComments } from "@utils/compiler/comments"
import { evaluateConditionals } from "@utils/compiler/conditionals"
import { evaluateEachLoops } from "@utils/compiler/each"
import { evaluateForLoops } from "@utils/compiler/for"
import { evaluateParameterObjects } from "@utils/compiler/parameterObjects"
import { extractAndInsertMixins } from "@utils/compiler/mixins"
import { compileSubroutines } from "@utils/compiler/subroutines"
import { convertTranslations } from "@utils/compiler/translations"
import { compileVariables } from "@utils/compiler/variables"
import { get } from "svelte/store"

export function compile(overrideContent = "", singleLanguageOverride = null): string {
  let joinedItems = overrideContent || get(flatItems)

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
  joinedItems = convertTranslations(joinedItems, singleLanguageOverride)

  const variables = compileVariables(joinedItems)
  const subroutines = compileSubroutines(joinedItems)

  return settings + variables + subroutines + joinedItems
}

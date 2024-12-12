import { completionsMap, mixinsMap, settings, subroutinesMap, variablesMap } from "@src/stores/editor"
import { translationsMap } from "@src/stores/translationKeys"
import type { ExtendedCompletion } from "@src/types/editor"
import { directlyInsideParameterObject } from "@utils/compiler/parameterObjects"
import { extraCompletions } from "@src/lib/extraCompletions"
import { inConfigType } from "@utils/parse"
import type { CompletionContext, CompletionResult } from "@codemirror/autocomplete"
import { get } from "svelte/store"

export function getCompletions(context: CompletionContext): CompletionResult | null {
  const word = context.matchBefore(/[@a-zA-Z0-9_ ]*/)

  if (!word) return null

  const add = word.text.search(/\S|$/)
  if (word.from + add == word.to && !context.explicit) return null

  // There's probably a better way of doing this
  let specialOverwrite = null
  if (word.text.includes("@i")) {
    specialOverwrite = get(mixinsMap)
  } else if (word.text.includes("@t")) {
    specialOverwrite = get(translationsMap)
  } else if (get(settings)["context-based-completions"]) {
    // Limit completions if the cursor is position for a parameter object key, if the parameter object is valid.
    const insideParameterObject = directlyInsideParameterObject(context.state.doc.toString(), context.pos)

    if (insideParameterObject?.phraseParameters.length) {
      specialOverwrite = insideParameterObject.phraseParameters.map(label => ({ label, type: "keyword" }))
    }
  }

  const totalCompletions: ExtendedCompletion[] = [
    ...get(completionsMap),
    ...get(variablesMap),
    ...get(subroutinesMap),
    ...extraCompletions
  ]

  // Limit completions by where in the rule the cursor is. Some types are not allowed certain parts.
  // For example, actions don't make sense within the event or conditions.
  if (!specialOverwrite && get(settings)["context-based-completions"]) {
    const configType = inConfigType(context.state.doc.toString(), context.pos)

    if (configType) {
      const excludeTypes = {
        event: ["variable", "map", "action", "value", "snippet", "rule"],
        conditions: ["action", "event", "snippet", "rule"],
        actions: ["event", "rule"]
      }

      specialOverwrite = totalCompletions.filter((c) => !excludeTypes[configType].includes(c.type || ""))
    }
  }

  return {
    from: word.from + add,
    to: word.to,
    options: specialOverwrite || totalCompletions,
    validFor: /^(?:[a-zA-Z0-9]+)$/i
  }
}

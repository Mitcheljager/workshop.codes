import type { Completion } from "@codemirror/autocomplete"
import { templates } from "@lib/templates"

export const extraCompletions: Completion[] = [
  { detail: "Editor For loop (exclusive)", label: "@for (0 to 10) {\n\n}", type: "snippet" },
  { detail: "Editor For loop (inclusive)", label: "@for (0 through 10) {\n\n}", type: "snippet" },
  { detail: "Editor If Statement", label: "@if (Mixin.variable) {\n\n}", type: "snippet" },
  { detail: "Editor Else If Statement", label: "@else if (Mixin.variable) {\n\n}", type: "snippet" },
  { detail: "Editor Else Statement", label: "@else {\n\n}", type: "snippet" },
  { detail: "Editor Each Statement", label: "@each (someVar in [one, two]) {\n\n}", type: "snippet" },
  { detail: "Editor Mixin", label: "@mixin mixinName(someVar) {\n\n}", type: "snippet" },
  { detail: "Each Player Rule", label: templates.RuleEachPlayer, type: "rule" },
  { detail: "Global Rule", label: templates.RuleGlobal, type: "rule" },
  { detail: "Subroutine", label: templates.Subroutine, type: "rule" }
]

import { templates } from "@lib/templates"

export const extraCompletions = [
  { detail: "Editor For loop (exclusive)", label: "@for (0 to 10) {\n\n}", type: "variable" },
  { detail: "Editor For loop (inclusive)", label: "@for (0 through 10) {\n\n}", type: "variable" },
  { detail: "Editor If Statement", label: "@if (Mixin.variable) {\n\n}", type: "variable" },
  { detail: "Editor Else If Statement", label: "@else if (Mixin.variable) {\n\n}", type: "variable" },
  { detail: "Editor Else Statement", label: "@else {\n\n}", type: "variable" },
  { detail: "Editor Each Statement", label: "@each (someVar in [one, two]) {\n\n}", type: "variable" },
  { detail: "Editor Mixin", label: "@mixin mixinName(someVar) {\n\n}", type: "variable" },
  { detail: "Each Player Rule", label: templates.RuleEachPlayer, type: "variable" },
  { detail: "Global Rule", label: templates.RuleGlobal, type: "variable" },
  { detail: "Subroutine", label: templates.Subroutine, type: "variable" }
]

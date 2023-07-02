import { hoverTooltip } from "@codemirror/view"
import { completionsMap } from "../stores/editor"
import { getPhraseFromPosition } from "../utils/parse"
import { get } from "svelte/store"

export function parameterTooltip() {
  return hoverTooltip((view, position) => {
    const line = view.state.doc.lineAt(position)

    if (!line.text) return null

    const phrase = getPhraseFromPosition(line, position)

    const possibleValues = get(completionsMap).filter(v => v.args_length)
    const validValue = possibleValues.find(v => v.label == phrase.text)

    if (!validValue) return null

    return {
      pos: line.from + phrase.start,
      end: line.from + phrase.end,
      above: true,
      create: () => {
        const dom = document.createElement("div")
        dom.textContent = validValue.detail_full
        return { dom }
      }
    }
  }, { hoverTime: 100 })
}

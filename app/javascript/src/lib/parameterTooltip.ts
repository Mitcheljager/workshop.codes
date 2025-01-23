import type { Extension } from "@codemirror/state"
import { hoverTooltip } from "@codemirror/view"
import { completionsMap, settings } from "@stores/editor"
import { getPhraseFromPosition } from "@utils/parse"
import { get } from "svelte/store"

export function parameterTooltip(): Extension {
  return hoverTooltip((view, position) => {
    const line = view.state.doc.lineAt(position)

    if (!line.text) return null

    const phrase = getPhraseFromPosition(line, position)

    const possibleValues = get(completionsMap).filter(v => v.info)
    const validValue = possibleValues.find(v => v.label == phrase.text)

    if (!validValue) return null

    return {
      pos: line.from + phrase.start,
      end: line.from + phrase.end,
      above: true,
      create: () => {
        const dom = document.createElement("div")
        dom.innerHTML = validValue.detail_full
        return { dom }
      }
    }
  }, { hoverTime: get(settings)["tooltip-hover-delay"] })
}

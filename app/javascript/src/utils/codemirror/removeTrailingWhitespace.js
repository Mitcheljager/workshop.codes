import { settings } from "@stores/editor"
import { get } from "svelte/store"

export function removeTrailingWhitespace({ state, dispatch }) {
  if (!get(settings)["remove-trailing-whitespace-on-save"]) return

  const changes = []

  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i)
    const match = line.text.match(/^(.*?)(\s+)$/)

    if (!match) continue

    const start = line.from + match[1].length
    const end = line.to

    changes.push({ from: start, to: end })
  }

  if (changes.length > 0) {
    dispatch(state.update({ changes }, { userEvent: "input" }))
  }

  return true
}

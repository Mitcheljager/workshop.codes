import type { ChangeSpec, EditorState } from "@codemirror/state"
import { settings } from "@stores/editor"
import { get } from "svelte/store"

export function fixCurlyBracketNewlineStyle({ state }: { state: EditorState }): ChangeSpec[] {
  const style = get(settings)["curly-brackets-newline-style"]
  if (style === "any") return []

  const changes: ChangeSpec[] = []

  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i)
    const text = line.text

    if (style === "always") {
      const match = text.match(/^(\s*)(.*?)([^\s{(])[^\S\r\n]*\{$/)
      if (!match) continue

      const indent = match[1]
      const before = match[1] + match[2] + match[3]

      changes.push({
        from: line.from,
        to: line.to,
        insert: `${before}\n${indent}{`
      })
    }

    if (style === "never") {
      const match = text.match(/^(\s*)\{$/)
      if (!match) continue
      if (i === 1) continue

      const prevLine = state.doc.line(i - 1)
      const prevText = prevLine.text

      if (!/[^\s{(][^\S\r\n]*$/.test(prevText)) continue

      const cleanedPrev = prevText.replace(/[^\S\r\n]+$/, "")

      changes.push({
        from: prevLine.from,
        to: line.to,
        insert: `${cleanedPrev} {`
      })
    }
  }

  return changes
}

import type { ChangeSpec, EditorState } from "@codemirror/state"

export function removeTrailingWhitespace({ state }: { state: EditorState }): ChangeSpec[] {
  const changes: ChangeSpec[] = []

  for (let i = 1; i <= state.doc.lines; i++) {
    const line = state.doc.line(i)
    const match = line.text.match(/^(.*?)(\s+)$/)

    if (!match) continue

    const start = line.from + match[1].length
    const end = line.to

    changes.push({ from: start, to: end })
  }

  return changes
}

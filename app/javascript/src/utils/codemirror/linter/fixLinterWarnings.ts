import type { EditorState } from "@codemirror/state"
import { removeTrailingWhitespace } from "./removeTrailingWhitespace"
import { fixCurlyBracketNewlineStyle } from "./fixCurlyBracketNewlineStyle"
import { get } from "svelte/store"
import { settings } from "@src/stores/editor"

export function fixLintWarnings({ state, dispatch }: { state: EditorState, dispatch: Function }): boolean {
  if (!get(settings)["fix-lint-on-save"]) return true

  const changes = [
    ...removeTrailingWhitespace({ state }),
    ...fixCurlyBracketNewlineStyle({ state })
  ]

  if (changes.length) {
    dispatch(state.update({ changes }, { userEvent: "input" }))
  }

  return true
}

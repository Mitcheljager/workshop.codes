import type { EditorState } from "@codemirror/state"

export type Project = {
  id: string,
  user_id: number
  title: string,
  content: string,
  uuid: string,
  created_at: string
  updated_at: string,
  content_type: "workshop_codes",
  is_owner: boolean
}

export type Item = {
  name: string,
  id: string,
  content: string,
  type: ItemType,
  position: number,
  parent: string,
  hidden: boolean,
  forceUpdate?: boolean
}

export type ItemType = "item" | "folder"

export type EditorStates = {
  [key: string]: EditorState
}

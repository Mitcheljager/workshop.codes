import type { EditorState } from "@codemirror/state"
import type { languageOptions } from "@src/lib/languageOptions"

export type Project = {
  title: string,
  content: string,
  uuid: string,
  id?: number,
  user_id?: number
  created_at?: string
  updated_at?: string,
  content_type?: "workshop_codes",
  is_owner: boolean
}

export type ProjectBackup = {
  uuid: string
  project_uuid: string,
  title: string,
  content: string,
  created_at: string,
  updated_at: string
}

export type RecoveredProject = {
  content: string
  updated_at: string
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

export type Range = [number, number]

export type EditorStates = {
  [key: string]: EditorState
}

export type Language = keyof typeof languageOptions

export type TranslationKey = {
  [locale in Language]: string
}

export type TranslateKeys = {
  [key: string]: TranslationKey
}

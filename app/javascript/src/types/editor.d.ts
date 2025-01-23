import type { EditorState } from "@codemirror/state"
import type { languageOptions } from "@src/lib/languageOptions"
import type { Completion } from "@codemirror/autocomplete"

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

export type Mixin = {
  content: string,
  full: string,
  params: { key: string, default: string }[],
  hasContents: boolean
}

export type ParameterObject = {
  start: number,
  end: number,
  given: Record<string, string>,
  givenKeys: string[],
  phraseParameters: string[],
  phraseDefaults: string[],
  phraseTypes: string[]
}

export type ExtendedCompletion = Completion & {
  parameter_keys: string[]
  parameter_defaults: string[],
  parameter_types: string[],
  args_length: number
  args_min_length: number,
  args_unlimited: boolean,
  args_allow_null: boolean,
  detail_full: string
}

export type WorkshopConstant = Record<string, Record<Language, string>>

export type ExpressionTree = {
  value: string | null,
  operator: string | null,
  invalid: boolean,
  arguments: ExpressionTree[]
}

export type ComparisonOperator = {
  type: string,
  order: number,
  _regexRegex?: RegExp,
  eval: Function
}

export type Variables = {
  playerVariables: string[],
  globalVariables: string[]
}

export type Severity = "hint" | "info" | "warning" | "error"

export type ConfigType = "event" | "conditions" | "actions" | "value"

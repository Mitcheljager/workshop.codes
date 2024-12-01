import { writable, derived } from "svelte/store"
import { getVariables } from "@utils/compiler/variables"
import { isAnyParentHidden } from "@utils/editor"
import { getMixins } from "@utils/compiler/mixins"
import { getSubroutines } from "@utils/compiler/subroutines"
import { debounced } from "@utils/debounceStore"
import type { EditorStates, ExtendedCompletion, Item, Project, RecoveredProject, WorkshopConstant } from "@src/types/editor"

// Preferably keep below the debounce time for the linter, so it
// has access to the most up-to-date information from the store.
const VARIABLE_EXTRACTION_DEBOUNCE_MS = 500

export const screenWidth = writable(0)
export const isMobile = derived(screenWidth, $screenWidth => $screenWidth && $screenWidth < 1000)

export const modal = (() => {
  const { subscribe, set } = writable<{ [key: string]: string } | null>(null)

  return {
    subscribe,
    show: (key: string, options = {}) => {
      set({ key, ...options })
    },
    close: () => {
      set(null)
    }
  }
})()

export const editorStates = writable<EditorStates>({})
export const editorScrollPositions = writable({})

export const projects = writable<Project[]>([])
export const currentProjectUUID = writable<string | null>(null)
export const currentProject = derived([projects, currentProjectUUID], ([$projects, $currentProjectUUID]) => {
  if (!$projects?.length) return null
  return $projects.filter(p => p.uuid == $currentProjectUUID)?.[0]
})

export const recoveredProject = writable<RecoveredProject | null>(null)

export const items = writable<Item[]>([])
export const currentItem = writable<Item | null>(null)

export const sortedItems = derived(items, $items => {
  const cleanedItems = $items.map((item) => {
    item.parent = $items.some(i => item.parent == i.id) ? item.parent : ""
    return item
  })

  return cleanedItems.sort((a, b) => a.position > b.position ? 1 : -1)
})

export const flatItems = derived(sortedItems, $sortedItems => {
  return $sortedItems
    .filter(i => !i.hidden && !isAnyParentHidden(i))
    .map(i => i.content).join("\n\n")
})

export const openFolders = writable<string[]>([])

export const isSignedIn = writable(false)

export const completionsMap = writable<ExtendedCompletion[]>([])
export const variablesMap = derived(flatItems, debounced(($flatItems: string) => {
  const { globalVariables, playerVariables } = getVariables($flatItems)

  return [
    ...globalVariables.map((v: string) => ({ detail: "Global Variable", label: v, type: "variable" })),
    ...playerVariables.map((v: string) => ({ detail: "Player Variable", label: v, type: "variable" }))
  ]
}, VARIABLE_EXTRACTION_DEBOUNCE_MS))

export const subroutinesMap = derived(flatItems, debounced(($flatItems: string) => {
  const subroutines = getSubroutines($flatItems)

  return [
    ...subroutines.map((v: string) => ({ detail: "Subroutine", label: v, type: "variable" }))
  ]
}, VARIABLE_EXTRACTION_DEBOUNCE_MS))

export const mixinsMap = derived(flatItems, debounced(($flatItems: string) => {
  const mixins = getMixins($flatItems)

  return mixins.map((v: string) => ({ detail: "Mixin", label: `@include ${v}()`, type: "variable" }))
}, VARIABLE_EXTRACTION_DEBOUNCE_MS))

/* Example: { "Color": { "AQUA": { "en-US": "Aqua" }, { "BLUE": { "en-US": "Blue" } } } */
export const workshopConstants = writable<Record<string, WorkshopConstant>>({})

export const customGameSettings = writable({})

export const heroes = writable([])

export const settings = writable({
  "editor-font": "Consolas",
  "editor-font-size": "14",
  "editor-cursor-color": "#ff00ff",
  "editor-cursor-width": "3",
  "color-string": "#98C379",
  "color-punctuation": "#6a9955",
  "color-keyword": "#E06C75",
  "color-number": "#d19a66",
  "color-comment": "#6a7277",
  "color-variable": "#9cdcfe",
  "color-action": "#e5c069",
  "color-value": "#6796e6",
  "color-operator": "#569cd6",
  "color-bool": "#d19a66",
  "color-invalid": "#b33834",
  "color-custom-keyword": "#c678dd",
  "show-indent-markers": true,
  "word-wrap": false,
  "autocomplete-semicolon": true,
  "autocomplete-parameter-objects": false,
  "autocomplete-min-parameter-size": 2,
  "autocomplete-min-parameter-newlines": 2,
  "hide-wiki-sidebar": false,
  "highlight-trailing-whitespace": true,
  "remove-trailing-whitespace-on-save": true
})

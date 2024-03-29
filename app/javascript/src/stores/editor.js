import { writable, derived } from "svelte/store"
import { getVariables } from "../utils/compiler/variables"
import { isAnyParentHidden } from "../utils/editor"
import { getMixins } from "../utils/compiler/mixins"
import { getSubroutines } from "../utils/compiler/subroutines"
import { debounced } from "../utils/debounceStore"

// Preferably keep below the debounce time for the linter, so it
// has access to the most up-to-date information from the store.
const VARIABLE_EXTRACTION_DEBOUNCE_MS = 500

export const screenWidth = writable(0)
export const isMobile = derived(screenWidth, $screenWidth => $screenWidth && $screenWidth < 1000)

export const modal = (() => {
  const { subscribe, set } = writable(null)

  return {
    subscribe,
    show: (key, options = {}) => {
      set({ key, ...options })
    },
    close: () => {
      set(null)
    }
  }
})()

export const editorStates = writable({})
export const editorScrollPositions = writable({})

export const projects = writable(null)
export const currentProjectUUID = writable(null)
export const currentProject = derived([projects, currentProjectUUID], ([$projects, $currentProjectUUID]) => {
  if (!$projects?.length) return null
  return $projects.filter(p => p.uuid == $currentProjectUUID)?.[0]
})

export const recoveredProject = writable(null)

export const items = writable([])
export const currentItem = writable({})

export const sortedItems = derived(items, $items => {
  const cleanedItems = $items.map(item => {
    item.parent = $items.some(i => item.parent == i.id) ? item.parent : null
    return item
  })

  return cleanedItems.sort((a, b) => a.position > b.position ? 1 : -1)
})

export const flatItems = derived(sortedItems, $sortedItems => {
  return $sortedItems
    .filter(i => !i.hidden && !isAnyParentHidden(i))
    .map(i => i.content).join("\n\n")
})

export const openFolders = writable([])

export const isSignedIn = writable(false)

export const completionsMap = writable([])
export const variablesMap = derived(flatItems, debounced($flatItems => {
  const { globalVariables, playerVariables } = getVariables($flatItems)

  return [
    ...globalVariables.map(v => ({ detail: "Global Variable", label: v, type: "variable" })),
    ...playerVariables.map(v => ({ detail: "Player Variable", label: v, type: "variable" }))
  ]
}, VARIABLE_EXTRACTION_DEBOUNCE_MS))

export const subroutinesMap = derived(flatItems, debounced($flatItems => {
  const subroutines = getSubroutines($flatItems)

  return [
    ...subroutines.map(v => ({ detail: "Subroutine", label: v, type: "variable" }))
  ]
}, VARIABLE_EXTRACTION_DEBOUNCE_MS))

export const mixinsMap = derived(flatItems, debounced($flatItems => {
  const mixins = getMixins($flatItems)

  return mixins.map(v => ({ detail: "Mixin", label: `@include ${ v }()`, type: "variable" }))
}, VARIABLE_EXTRACTION_DEBOUNCE_MS))

export const workshopConstants = writable({})

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
  "autocomplete-min-parameter-newlines": 2
})

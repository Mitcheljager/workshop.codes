import { writable, derived } from "svelte/store"
import { getMixins, getSubroutines, getVariables } from "../utils/compiler"
import { isAnyParentHidden } from "../utils/editor"

export const editorStates = writable({})

export const projects = writable(null)
export const currentProjectUUID = writable(null)
export const currentProject = derived([projects, currentProjectUUID], ([$projects, $currentProjectUUID]) => {
  if (!$projects?.length) return null
  return $projects.filter(p => p.uuid == $currentProjectUUID)?.[0]
})

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
export const variablesMap = derived(flatItems, $flatItems => {
  const { globalVariables, playerVariables } = getVariables($flatItems)
  const subroutines = getSubroutines($flatItems)

  return [
    ...globalVariables.map(v => ({ detail: "Global Variable", label: v, type: "variable" })),
    ...playerVariables.map(v => ({ detail: "Player Variable", label: v, type: "variable" })),
    ...subroutines.map(v => ({ detail: "Subroutine", label: v, type: "variable" }))
  ]
})

export const mixinsMap = derived(flatItems, $flatItems => {
  const mixins = getMixins($flatItems)

  return mixins.map(v => ({ detail: "Mixin", label: `@include ${ v }()`, type: "variable" }))
})

export const workshopConstants = writable({})

import { writable, derived } from "svelte/store"

export const completionsMap = writable([])

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

export const openFolders = writable([])

export const isSignedIn = writable(false)

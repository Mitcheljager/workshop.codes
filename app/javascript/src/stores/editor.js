import { writable, derived } from "svelte/store"

export const editorStates = writable({})

export const projects = writable(null)
export const currentProject = writable(null)

export const items = writable([])
export const currentItem = writable({})

export const sortedItems = derived(items, $items => {
  const cleanedItems = $items.map(item => {
    item.parent = $items.some(i => item.parent == i.id) ? item.parent : null
    return item
  })

  return cleanedItems.sort((a, b) => a.position > b.position)
})

export const isSignedIn = writable(false)

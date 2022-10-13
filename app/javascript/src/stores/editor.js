import { writable, derived } from "svelte/store"

export const editorStates = writable({})

export const projects = writable(null)
export const currentProject = writable(null)

export const items = writable([])
export const currentItem = writable({})

export const sortedItems = derived(items, $items => $items.sort((a, b) => a.position > b.position))

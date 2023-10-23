import { currentItem, items, openFolders, editorStates } from "../stores/editor"
import { defaultLanguage, selectedLanguages, translationKeys } from "../stores/translationKeys"
import { get } from "svelte/store"

export function createNewItem(name, content, position = 9999, type = "item") {
  const item = {
    name: name,
    id: Math.random().toString(16).substring(2, 8),
    type: type,
    position,
    content: content
  }

  return item
}

export function destroyItem(id) {
  if (get(currentItem).id == id || get(currentItem).parent == id) currentItem.set({})
  items.set(get(items).filter(i => i.id != id && i.parent != id))
}

export function updateItemName(id, name) {
  items.set(get(items).map(i => {
    if (i.id == id) i.name = name
    return i
  }))
}

export function toggleHideItem(id) {
  items.set(get(items).map(i => {
    if (i.id == id) i.hidden = !i.hidden
    return i
  }))
}

export function isAnyParentHidden(item) {
  while (item.parent) {
    item = get(items).find(i => i.id === item.parent)

    if (item.hidden) return true
  }

  return false
}

export function duplicateItem(item, newParent = null) {
  const itemCount = get(items).filter(i => {
    if (i.parent != item.parent) return false
    return i.name.match(/\(Copy(?: \d+)?\)/g)
  })?.length

  const copyString = ` (Copy${ itemCount ? ` ${ itemCount + 1 }` : "" })`
  const name = newParent ? item.name : (item.name.replace(/\s\(Copy(?: \d+)?\)/g, "") + copyString)
  const newItem = createNewItem(name, item.content, item.position, item.type)
  newItem.parent = newParent || item.parent
  newItem.hidden = item.hidden

  items.set([...get(items), newItem])

  if (item.type == "folder") {
    get(items).filter(i => i.parent == item.id).forEach(i => duplicateItem(i, newItem.id))
  }
}

export function getItemById(id) {
  return get(items).find(i => i.id == id) || null
}

export function setCurrentItemById(id) {
  const item = getItemById(id)

  if (!item) return

  currentItem.set(item)

  if (!item.parent) return
  const parent = getItemById(item.parent)
  if (parent) toggleFolderState(parent, true)
}

export function updateItem(newItem) {
  items.set(get(items).map(item => {
    if (item.id != newItem.id) return item
    return newItem
  }))

  updateStateForId(newItem.id, newItem.content)
}

export async function updateStateForId(id, insert) {
  const state = get(editorStates)[id]

  if (!state) return

  const transaction = state.update({changes: {from: 0, to: state.doc.length, insert}})

  editorStates.set({
    ...get(editorStates),
    [id]: transaction.state
  })

  if (get(currentItem).id == id) currentItem.set({ ...get(currentItem), forceUpdate: true })
}

export function toggleFolderState(item, state, set = true) {
  if (item?.type != "folder") return

  if (set) localStorage.setItem(`folder_expanded_${ item.id }`, state)

  if (state) openFolders.set([...get(openFolders), item.id])
  else openFolders.set([...get(openFolders).filter(f => f != item.id)])

  if (item.parent) toggleFolderState(getItemById(item.parent), true)
}

export function getSaveContent() {
  return JSON.stringify({
    items: get(items),
    translations: {
      keys: get(translationKeys),
      selectedLanguages: get(selectedLanguages),
      defaultLanguage: get(defaultLanguage)
    }
  })
}

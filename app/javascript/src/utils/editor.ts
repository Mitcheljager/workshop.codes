import { currentItem, items, openFolders, editorStates } from "@stores/editor"
import { defaultLanguage, selectedLanguages, translationKeys } from "@stores/translationKeys"
import { get } from "svelte/store"
import type { Item, ItemType } from "@src/types/editor"

export function createNewItem(name: string, content: string, position = 9999, type: ItemType = "item"): Item {
  const item: Item = {
    name: name,
    id: Math.random().toString(16).substring(2, 8),
    type: type,
    position,
    content: content,
    parent: '',
    hidden: false
  }

  return item
}

export function destroyItem(id: string): void {
  if (get(currentItem)?.id == id || get(currentItem)?.parent == id) currentItem.set(null)
  items.set(get(items).filter(i => i.id != id && i.parent != id))
}

export function updateItemName(id: string, name: string): void {
  items.set(get(items).map(i => {
    if (i.id == id) i.name = name
    return i
  }))
}

export function toggleHideItem(id: string): void {
  items.set(get(items).map(i => {
    if (i.id == id) i.hidden = !i.hidden
    return i
  }))
}

export function isAnyParentHidden(item: Item): boolean {
  while (item.parent) {
    const parentItem: Item | undefined = get(items).find(i => i.id === item.parent)

    if (parentItem?.hidden) return true
  }

  return false
}

export function duplicateItem(item: Item, newParent: string = ''): void {
  const itemCount = get(items).filter(i => {
    if (i.parent != item.parent) return false
    return i.name.match(/\(Copy(?: \d+)?\)/g)
  })?.length

  const copyString = ` (Copy${itemCount ? ` ${itemCount + 1}` : ""})`
  const name = newParent ? item.name : (item.name.replace(/\s\(Copy(?: \d+)?\)/g, "") + copyString)
  const newItem = createNewItem(name, item.content, item.position, item.type)
  newItem.parent = newParent || item.parent
  newItem.hidden = item.hidden

  items.set([...get(items), newItem])

  if (item.type == "folder") {
    get(items).filter(i => i.parent == item.id).forEach(i => duplicateItem(i, newItem.id))
  }
}

export function getItemById(id: string): Item | null {
  return get(items).find(i => i.id == id) || null
}

export function setCurrentItemById(id: string) {
  const item = getItemById(id)

  if (!item) return

  currentItem.set(item)

  if (!item.parent) return
  const parent = getItemById(item.parent)
  if (parent) toggleFolderState(parent, true)
}

export function updateItem(newItem: Item): void {
  items.set(get(items).map(item => {
    if (item.id != newItem.id) return item
    return newItem
  }))

  updateStateForId(newItem.id, newItem.content)
}

export function updateStateForId(id: string, insert: string): void {
  const state = get(editorStates)[id]

  if (!state) return

  const transaction = state.update({ changes: { from: 0, to: state.doc.length, insert }})

  editorStates.set({
    ...get(editorStates),
    [id]: transaction.state
  })

  if (get(currentItem)!.id == id) currentItem.set({ ...get(currentItem)!, forceUpdate: true })
}

export function toggleFolderState(item: Item, state: boolean, set = true): void {
  if (item?.type != "folder") return

  if (set) localStorage.setItem(`folder_expanded_${item.id}`, state.toString())

  if (state) openFolders.set([...get(openFolders), item.id])
  else openFolders.set([...get(openFolders).filter(f => f != item.id)])

  if (item.parent) toggleFolderState(getItemById(item.parent)!, true)
}

export function getSaveContent(): string {
  return JSON.stringify({
    items: get(items),
    translations: {
      keys: get(translationKeys),
      selectedLanguages: get(selectedLanguages),
      defaultLanguage: get(defaultLanguage)
    }
  })
}

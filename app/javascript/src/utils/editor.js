import { currentItem, items } from "../stores/editor"
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
  // The store needs to be updated across the board
  // Otherwise their value will get overwritten on change
  // There's probably a better way of doing this
  items.set(get(items).map(i => {
    if (i.id == id) i.name = name
    return i
  }))
}

export function getClosingBracket(content, characterOpen = "{", characterClose = "}", start = 0) {
  let closePos = start
  let counter = 1
  let initial = true

  while (counter > 1 || initial) {
    const c = content[++closePos]

    if (c == characterOpen) {
      counter++
      initial = false
    }
    else if (c == characterClose) counter--
    if (counter > 20 || closePos > 100_000 || closePos >= content.length) break
  }

  return closePos
}

export function getSettings(value) {
  const regex = new RegExp(/settings/)
  const match = regex.exec(value)
  if (!match) return []

  const untilIndex = match.index + getClosingBracket(value.slice(match.index, value.length))
  if (!untilIndex) return []

  return [match.index, untilIndex + 1]
}

export function replaceBetween(origin, replace, startIndex, endIndex) {
  return origin.substring(0, startIndex) + replace + origin.substring(endIndex)
}

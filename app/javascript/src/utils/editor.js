import { currentItem, items, openFolders, projects, editorStates } from "../stores/editor"
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
    if (counter > 20 || closePos > (100_000 + start) || closePos >= content.length) break
  }

  return closePos
}

export function splitArgumentsString(content) {
  let ignoredByString = false
  let ignoredByBrackets = 0
  const commaIndexes = []

  for (let i = 0; i < content.length; i++) {
    if (content[i] == "\\")
      i++
    else if (content[i] == "\"")
      ignoredByString = !ignoredByString
    else if (!ignoredByString && ["(", "[", "{"].includes(content[i]))
      ignoredByBrackets++
    else if (!ignoredByString && [")", "]", "}"].includes(content[i]))
      ignoredByBrackets = Math.min(ignoredByBrackets - 1 || 0)
    else if (!ignoredByString && !ignoredByBrackets && content[i] == ",")
      commaIndexes.push(i)
  }

  if (!commaIndexes.length) return [content]

  const splitArguments = []
  splitArguments.push(content.substring(0, commaIndexes[0]))

  commaIndexes.forEach((comma, index) => {
    splitArguments.push(content.substring(comma + 1, commaIndexes[index + 1]).trim())
  })

  return splitArguments
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

export function getPhraseEnd(text, start, direction = 1) {
  let lastValidCharacterPosition = start
  for (let i = 1; i < 100; i++) {
    const char = text[start + i * direction]
    if (char !== undefined && /[A-Za-z\- ]/.test(char)) lastValidCharacterPosition += direction
    else i = 100
  }

  return lastValidCharacterPosition
}

export function getPhraseFromPosition(line, position) {
  const start = getPhraseEnd(line.text, position - line.from, -1)
  const end = getPhraseEnd(line.text, position - line.from, 1)

  return {
    start,
    end,
    text: line.text.slice(start, end + 1).trim()
  }
}

export function setCssVariable(key, value) {
  document.body.style.setProperty(`--${ key }`, value)
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

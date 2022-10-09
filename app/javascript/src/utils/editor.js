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

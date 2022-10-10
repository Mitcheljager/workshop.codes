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

export function getClosingBracket(content) {
  let closePos = 0
  let counter = 1
  let initial = true

  while (counter > 1 || initial) {
    const c = content[++closePos]

    if (c == "{") {
      counter++
      initial = false
    }
    else if (c == "}") counter--
    if (counter > 5 || closePos > 10000) counter = 0
  }

  return closePos
}

export function getSettings(value) {
  const regex = new RegExp(/settings/)
  const match = regex.exec(value)
  if (!match) return

  const untilIndex = match.index + getClosingBracket(value.slice(match.index, value.length))
  if (!untilIndex) return

  console.log(untilIndex)

  return [match.index, untilIndex + 1]
}

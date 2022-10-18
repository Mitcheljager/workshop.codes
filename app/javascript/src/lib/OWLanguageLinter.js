import { getClosingBracket } from "../utils/editor"

export function OWLanguageLinter(view) {
  const diagnostics = []

  const content = view.state.doc.toString()

  const openingCharacters = [
    { open: "{", close: "}", message: "Missing closing curly bracket \"{\"" },
    { open: "[", close: "]", message: "Missing closing square bracket \"[\"" },
    { open: "(", close: ")", message: "Missing closing parenthesis \"(\"" }
  ]

  openingCharacters.forEach(({ open, close, message }) => {
    const openingBrackets = findAllCharacters(content, open)
    openingBrackets.forEach(index => {
      const closingBracketIndex = getClosingBracket(content, open, close, index - 1)

      if (closingBracketIndex < content.length) return

      diagnostics.push({
        from: index,
        to: index + 1,
        severity: "error",
        message
      })
    })
  })

  return diagnostics
}

function findAllCharacters(content, character = "{") {
  const indices = []

  for(let i = 0; i < content.length; i++) {
    if (content[i] == character) indices.push(i)
  }

  return indices
}

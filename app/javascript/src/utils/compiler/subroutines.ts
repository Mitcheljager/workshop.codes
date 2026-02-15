export function compileSubroutines(joinedItems: string): string {
  const subroutines = getSubroutines(joinedItems)

  if (!subroutines.length) return ""

  return `
subroutines {
${subroutines.map((v, i) => `    ${i}: ${v}`).join("\n")}
}\n\n`
}

export function getSubroutines(joinedItems: string): string[] {
  const declaredSubroutines = Array.from(joinedItems.matchAll(/Subroutine;[\r\n]+([^\r\n;]+)/g))
    .map((match) => {
      let value = match[1]
      const linemarkerString = "[/linemarker]"
      const linemarkerIndex = value.indexOf(linemarkerString)

      if (linemarkerIndex > -1) value = value.slice(linemarkerIndex + linemarkerString.length)

      return value.trim()
    })

  const usedSubroutines = Array.from(joinedItems.matchAll(/(?:Call Subroutine|Start Rule)\s*\(([^,\)]+)/g))
    .map((match) => match[1].trim())

  return [...new Set([...declaredSubroutines, ...usedSubroutines])]
}

export function compileSubroutines(joinedItems) {
  const subroutines = getSubroutines(joinedItems)

  if (!subroutines.length) return ""

  return `
subroutines {
${subroutines.map((v, i) => `    ${i}: ${v}`).join("\n")}
}\n\n`
}

export function getSubroutines(joinedItems) {
  const declaredSubroutines = Array.from(joinedItems.matchAll(/Subroutine;[\r\n]+([^\r\n;]+)/g))
    .map((match) => match[1].trim())
  const usedSubroutines = Array.from(joinedItems.matchAll(/(?:Call Subroutine|Start Rule)\s*\(([^,\)]+)/g))
    .map((match) => match[1].trim())
  return [...new Set([...declaredSubroutines, ...usedSubroutines])]
}

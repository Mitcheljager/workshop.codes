import { getClosingBracket, replaceBetween } from "../parse"

export function evaluateForLoops(joinedItems) {
  let match
  const forRegex = /@for\s+\(\s*((?:(\w+)\s+)?(?:from\s+))?(\d+)\s+(?:(through|to)\s+)?(\d+)\s*\)\s*\{/g // Matches "@for ([var] [from] number through|to number) {" in groups for each param
  while ((match = forRegex.exec(joinedItems)) != null) {
    const [full, _, variable, start, clusivity, end] = match

    const inclusive = clusivity === "through"
    const openingBracketIndex = match.index + full.length - 1
    const closingBracketIndex = getClosingBracket(joinedItems, "{", "}", openingBracketIndex - 1)

    const content = joinedItems.substring(openingBracketIndex + 1, closingBracketIndex)

    // Replace "For.[variable]" with the current index
    let repeatedContent = ""
    for(let i = parseInt(start); i < parseInt(end) + (inclusive ? 1 : 0); i++) {
      repeatedContent += content.replaceAll(`For.${ variable || "i" }`, i)
    }

    joinedItems = replaceBetween(joinedItems, repeatedContent, match.index, closingBracketIndex + 1)
    forRegex.lastIndex = 0 // This is necessary in case the replaced content is shorter than the original content
  }

  return joinedItems
}

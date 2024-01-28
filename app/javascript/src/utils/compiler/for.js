import { getClosingBracket, replaceBetween } from "../parse"

export function evaluateForLoops(joinedItems) {
  let match
  const forRegex = /@for\s+\(\s*((?:(\w+)\s+)?(?:from\s+))?(\d+)\s+(?:(through|to)\s+)?(\d+)(?:\s*in steps of\s+(\d+))?\s*\)\s*\{/g // Matches "@for ([var] [from] number through|to number [in steps of number]) {" in groups for each param
  while ((match = forRegex.exec(joinedItems)) != null) {
    const [full, _, variable, startString, clusivityKeyword, endString, stepString = "1"] = match

    const inclusive = clusivityKeyword === "through"
    const openingBracketIndex = match.index + full.length - 1
    const closingBracketIndex = getClosingBracket(joinedItems, "{", "}", openingBracketIndex - 1)

    const content = joinedItems.substring(openingBracketIndex + 1, closingBracketIndex)

    const [start, end, step] = [parseInt(startString), parseInt(endString), parseInt(stepString)]
    if (step === 0) throw new Error("For loop would cause an infinite loop")

    // Replace "For.[variable]" with the current index
    let repeatedContent = ""
    for(let i = start; i < end + (inclusive ? step : 0); i += step) {
      repeatedContent += content.replaceAll(`For.${ variable || "i" }`, i)
    }

    joinedItems = replaceBetween(joinedItems, repeatedContent, match.index, closingBracketIndex + 1)
    forRegex.lastIndex = 0 // This is necessary in case the replaced content is shorter than the original content
  }

  return joinedItems
}

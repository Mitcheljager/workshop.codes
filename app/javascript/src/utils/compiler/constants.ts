export const openToClosingArrayBracketsMap: Record<string, string> = {
  "(": ")",
  "[": "]"
}

export const openArrayBracketRegex = new RegExp(
  `(?<!\\\\)(?:${Object.keys(openToClosingArrayBracketsMap)
    .map((c) => `\\${c}`)
    .join("|")})`,
  "g"
)

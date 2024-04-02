export const openToClosingArrayBracketsMap = {
  "(": ")",
  "[": "]"
}

export const openArrayBracketRegex = new RegExp(
  `(?<!\\\\)(?:${Object.keys(openToClosingArrayBracketsMap)
    .map((c) => `\\${c}`)
    .join("|")})`,
  "g"
)

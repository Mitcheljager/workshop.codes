import { findRangesOfStrings, getClosingBracket, matchAllOutsideRanges, splitArgumentsString } from "../parse"
import { evaluateParameterObjects } from "@src/parameterObjects"

// NOTE: The fact variable names can start with a decimal is intentional.
// We leave it to Overwatch to warn the user that this is not allowed.
const globalVariablesRegex = /(?<=Global\.)[A-Za-z0-9_]+/g

/**
 * This regex tries to capture:
 *   "Event Player.playerVar" => ".playerVar"
 *   "Event Player.playerVar.otherPlayerVar" => ".playerVar", ".otherPlayerVar"
 *   "Global.myGlobalVar" => ❌ no match
 *   "Global.myGlobalVar.myPlayerVar" => ".myPlayerVar"
 *   "Global.myGlobalVar.myPlayerVar.otherPlayerVar" => ".myPlayerVar", ".otherPlayerVar"
 *   "Global.Global.Global.myPlayerVar.otherPlayerVar" => "Global" (the second one), ".myPlayerVar", ".otherPlayerVar"
 *
 */
const possiblePlayerVariablesRegex = /(?<![^\w.]Global)\.(?<variableName>[A-Za-z0-9_]+)/g

const invalidVariablePrefixRegex = /(?:^|(?:^|[^\w.])(?:\d+|D)|[^A-Za-z0-9_)\]])$/

const maxInitialVariableCount = 26 // A to Z
const maxVariableNameLength = 32

const actionsDefiningVariablesRegex = /(?:(?:Set|Modify) (?:Global|Player) Variable(?: At Index)?|For (?:Global|Player) Variable|Chase (?:Global|Player) Variable (?:Over Time|At Rate))\(/g

export function getDefaultVariableNameIndex(name) {
  const singleCharFirstIndexOffset = "A".charCodeAt(0) - 1
  const maxSingleCharIndex = "Z".charCodeAt(0) - singleCharFirstIndexOffset

  if (!/^[A-Z]{1,2}$/.test(name)) {
    return -1
  }

  const index = name
    .split("")
    .reduce((total, char, pos) => {
      const charIndex = char.charCodeAt(0) - singleCharFirstIndexOffset
      total += charIndex * Math.pow(maxSingleCharIndex, name.length - pos - 1)
      return total
    }, 0)

  return index - 1
}

/**
 * Exclude variables that would already be defined by default.
 *
 * For example, the following would fail because Workshop already declares "B"
 * at index 1 by default:
 * ```
 *   global:
 *     0: B // error: B is already declared at index 1
 * ```
 *
 * On the other hand, the following would not fail because the variable name at
 * index 1 was overwritten:
 * ```
 *   global:
 *     0: B // this is fine because we overwrite the name at index 1
 *     1: someNameThatIsNotJustB
 * ```
 *
 * Anything past Z (AA, AB, ..., DY, DX) should not be excluded as in the
 * in-game editor these variables can be added dynamically.
 * So in the following examples, Workshop doesn't complain if we map a variable
 * with the same name:
 * ```
 *   global:
 *     0: A
 *     1: B
 *     // ...
 *     25: Z
 *     26: AZ // this is fine because index 51 (what would be AZ) hasn't been mapped by Workshop yet
 * ```
 *
 * ```
 *   global:
 *     0: A
 *     1: B
 *     // ...
 *     25: Z
 *     26: AZ // this is also fine, because we rename index 51 (what would be AZ)
 *     // ...
 *     50: AY
 *     51: someNameThatIsNotJustAZ
 *     52: BA
 * ```
 *
 * @param {string[]} variables A list of variables
 * @returns {string[]} The list of variables without
 */
export function excludeDefaultVariableNames(variables) {
  let removedCount = 0
  return variables.filter((name) => {
    const defaultIndex = getDefaultVariableNameIndex(name)
    if (
      defaultIndex >= 0 &&
      defaultIndex < maxInitialVariableCount &&
      defaultIndex >= (variables.length - removedCount)) {
      removedCount++
      return false
    }
    return true
  })
}

export function compileVariables(joinedItems) {
  let { globalVariables, playerVariables } = getVariables(joinedItems)

  globalVariables = excludeDefaultVariableNames(globalVariables)
  playerVariables = excludeDefaultVariableNames(playerVariables)

  if (!globalVariables?.length && !playerVariables.length) return ""

  return `
variables {
${globalVariables.length ? "  global:" : ""}
${globalVariables.map((v, i) => `    ${i}: ${v}`).join("\n")}

${playerVariables.length ? "  player:" : ""}
${playerVariables.map((v, i) => `    ${i}: ${v}`).join("\n")}
}\n\n`
}

function getLiteralPlayerVariables(source, stringRanges) {
  const literalPlayerVariables = []
  for (const match of matchAllOutsideRanges(stringRanges, source, possiblePlayerVariablesRegex)) {
    const matchPrefix = source.substring(match.index - maxVariableNameLength, match.index)
    if (invalidVariablePrefixRegex.test(matchPrefix)) {
      continue
    }

    const { variableName } = match.groups
    literalPlayerVariables.push(variableName)
  }
  return literalPlayerVariables
}

export function getVariables(joinedItems) {
  joinedItems = evaluateParameterObjects(joinedItems)
  const stringRanges = findRangesOfStrings(joinedItems)

  const playerVariablesFromActions = []
  const globalVariablesFromActions = []
  for (const match of matchAllOutsideRanges(stringRanges, joinedItems, actionsDefiningVariablesRegex)) {
    const argsContent = joinedItems.substring(
      match.index + match[0].length,
      getClosingBracket(joinedItems, "(", ")", match.index - 1)
    )
    const args = splitArgumentsString(argsContent)

    const isPlayer = match[0].includes("Player")

    if (isPlayer) {
      if (!args[1]?.length) continue
      playerVariablesFromActions.push(args[1])
    } else {
      if (!args[0]?.length) continue
      globalVariablesFromActions.push(args[0])
    }
  }

  const literalGlobalVariables = matchAllOutsideRanges(stringRanges, joinedItems, globalVariablesRegex).map((match) => match[0])
  const literalPlayerVariables = getLiteralPlayerVariables(joinedItems, stringRanges)

  const playerVariables = [...new Set([...literalPlayerVariables, ...playerVariablesFromActions])]
  const globalVariables = [...new Set([...literalGlobalVariables, ...globalVariablesFromActions])]

  return { globalVariables, playerVariables }
}

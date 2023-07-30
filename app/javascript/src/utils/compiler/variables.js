import { findRangesOfStrings, getClosingBracket, matchAllOutsideRanges, splitArgumentsString } from "../parse"

/**
 * This regex tries to capture:
 *   "Event Player.playerVar" => ".playerVar"
 *   "Event Player.playerVar.otherPlayerVar" => ".playerVar", ".otherPlayerVar"
 *   "Global.myGlobalVar" => ❌ no match
 *   "Global.myGlobalVar.myPlayerVar" => ".myPlayerVar"
 *   "Global.myGlobalVar.myPlayerVar.otherPlayerVar" => ".myPlayerVar", ".otherPlayerVar"
 *   "Global.Global.Global.myPlayerVar.otherPlayerVar" => "Global" (the second one), ".myPlayerVar", ".otherPlayerVar"
 */
const possiblePlayerVariablesRegex = /(?<![^\w.]Global)\.(?<variableName>[^\s,.[\]));"]+)/g

const invalidVariablePrefixRegex = /[^\w.](?:\d+|D)$/

const maxVariableNameLength = 32

const actionsDefiningVariablesRegex = /(?:(?:Set|Modify) (?:Global|Player) Variable(?: At Index)?|For (?:Global|Player) Variable|Chase (?:Global|Player) Variable (?:Over Time|At Rate))\(/g

export function compileVariables(joinedItems) {
  const { globalVariables, playerVariables } = getVariables(joinedItems)

  if (!globalVariables?.length && !playerVariables.length) return ""

  return `
variables {
${ globalVariables.length ? "  global:" : "" }
${ globalVariables.map((v, i) => `    ${ i }: ${ v }`).join("\n") }

${ playerVariables.length ? "  player:" : "" }
${ playerVariables.map((v, i) => `    ${ i }: ${ v }`).join("\n") }
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
  const stringRanges = findRangesOfStrings(joinedItems)

  const playerVariablesFromActions = []
  const globalVariablesFromActions = []
  for (const match of matchAllOutsideRanges(stringRanges, joinedItems, actionsDefiningVariablesRegex)) {
    const argsContent = joinedItems.substring(
      match.index + match[0].length,
      getClosingBracket(joinedItems, "(", ")", match.index) - 1
    )
    const args = splitArgumentsString(argsContent)

    const isPlayer = match[0].includes("Player")

    if (isPlayer) {
      playerVariablesFromActions.push(args[1])
    } else {
      globalVariablesFromActions.push(args[0])
    }
  }

  const literalGlobalVariables = matchAllOutsideRanges(stringRanges, joinedItems, /(?<=Global\.)[^\s,.[\]);]+/g).map((match) => match[0])
  const literalPlayerVariables = getLiteralPlayerVariables(joinedItems, stringRanges)

  const playerVariables = [...new Set([...literalPlayerVariables, ...playerVariablesFromActions])]
  const globalVariables = [...new Set([...literalGlobalVariables, ...globalVariablesFromActions])]

  return { globalVariables, playerVariables }
}

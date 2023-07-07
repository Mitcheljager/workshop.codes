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

export function getVariables(joinedItems) {
  let globalVariables = joinedItems.match(/(?<=Global\.)[^\s,.[\]);]+/g) || []
  globalVariables = [...globalVariables, ...(joinedItems.match(/(?<=For Global Variable\()[^\s,.[\]);]+/g) || [])]
  globalVariables = [...new Set(globalVariables)]

  const playerForLoops =  [...joinedItems.matchAll(/(?<=For Player Variable\()[^,]+[, \t]+([^\s,]+)/g)].map(v => v[1])
  let playerVariables = joinedItems.match(/(?<=(Event Player|Victim|Attacker|Healer|Healee|Local Player|Host Player)\.)[^\s,.[\]);]+/g) || []
  playerVariables = [...new Set([...playerVariables, ...playerForLoops])]

  return { globalVariables, playerVariables }
}

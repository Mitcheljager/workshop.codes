<script>
  import { sortedItems } from "../../stores/editor"
  import { getSettings } from "../../utils/editor"

  function compile() {
    let joinedItems = $sortedItems.sort().map(i => i.content).join("\n\n")

    const [settingsStart, settingsEnd] = getSettings(joinedItems)
    const settings = joinedItems.slice(settingsStart, settingsEnd)

    joinedItems = joinedItems.replace(settings, "")

    let variables = compileVariables(joinedItems)
    let subroutines = compileSubroutines(joinedItems)

    console.log(settings + variables + subroutines + joinedItems)
  }

  function compileVariables(joinedItems) {
    let globalVariables = joinedItems.match(/(?<=Global\.).[^\s,.[\]);]+/g)
    globalVariables = [...new Set(globalVariables)]

    let playerVariables = joinedItems.match(/(?<=(Event Player|Victim|Attacker|Healer|Healee)\.).[^\s,.[\]);]+/g)
    playerVariables = [...new Set(playerVariables)]

    return `
variables {
${globalVariables.length ? "global:" : ""}
${globalVariables.map((v, i) => `    ${i}: ${v}`).join("\n")}

${playerVariables.length ? "player:" : ""}
${playerVariables.map((v, i) => `    ${i}: ${v}`).join("\n")}
}\n\n`
  }

  function compileSubroutines(joinedItems) {
    let subroutines = joinedItems.match(/Subroutine;[\r\n]+([^\r\n;]+)/g)
    subroutines = subroutines.map(s => s.replace("Subroutine;\n", "").replace(/\s/g, ""))
    subroutines = [...new Set(subroutines)]

    console.log(subroutines)

    return `
subroutines {
${subroutines.map((v, i) => `  ${i}: ${v}`).join("\n")}
}\n\n`
  }
</script>

<button class="button button--secondary" on:click={compile}>Compile</button>


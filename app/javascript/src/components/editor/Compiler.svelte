<script>
  import { fly } from "svelte/transition"
  import { sortedItems } from "../../stores/editor"
  import { getSettings } from "../../utils/editor"

  let compiling = false
  let copied = false

  function compile() {
    compiling = true

    try {
      let joinedItems = $sortedItems.sort().map(i => i.content).join("\n\n")

      const [settingsStart, settingsEnd] = getSettings(joinedItems)
      const settings = joinedItems.slice(settingsStart, settingsEnd)

      joinedItems = joinedItems.replace(settings, "")

      const variables = compileVariables(joinedItems)
      const subroutines = compileSubroutines(joinedItems)

      setTimeout(() => {
        compiling = false
        copyToClipboard(settings + variables + subroutines + joinedItems)
      }, 500)
    } catch (error) {
      alert(`Something went wrong while compiling, this might be an error on our part or an error in your code. ${ error }`)
      compiling = false
    }
  }

  function compileVariables(joinedItems) {
    let globalVariables = joinedItems.match(/(?<=Global\.).[^\s,.[\]);]+/g)
    globalVariables = [...new Set(globalVariables)]

    let playerVariables = joinedItems.match(/(?<=(Event Player|Victim|Attacker|Healer|Healee)\.).[^\s,.[\]);]+/g)
    playerVariables = [...new Set(playerVariables)]

    return `
variables {
${ globalVariables.length ? "global:" : "" }
${ globalVariables.map((v, i) => `    ${ i }: ${ v }`).join("\n") }

${ playerVariables.length ? "player:" : "" }
${ playerVariables.map((v, i) => `    ${ i }: ${ v }`).join("\n") }
}\n\n`
  }

  function compileSubroutines(joinedItems) {
    let subroutines = joinedItems.match(/Subroutine;[\r\n]+([^\r\n;]+)/g) || []
    subroutines = [...subroutines, ...(joinedItems.match(/Call Subroutine\((.*)\)/g) || [])]
    subroutines = subroutines.map(s => s.replace("Subroutine;\n", "").replace("Call Subroutine", "").replace(/[\())\s]/g, ""))
    subroutines = [...new Set(subroutines)]

    return `
subroutines {
${ subroutines.map((v, i) => `  ${ i }: ${ v }`).join("\n") }
}\n\n`
  }

  function copyToClipboard(value) {
    copied = true

    const input = document.createElement("textarea")
    input.value = value
    document.body.appendChild(input)

    input.select()
    document.execCommand("copy")
    document.body.removeChild(input)

    setTimeout(() => copied = false, 1000)
  }
</script>

<button class="button button--secondary tooltip" on:click={compile}>
  {#if compiling}
    Compiling...
  {:else}
    Compile
  {/if}

  {#if copied}
    <div transition:fly={{ y: 5, duration: 150 }} class="tooltip__content bg-primary text-pure-white block">
      Copied to clipboard
    </div>
  {/if}
</button>


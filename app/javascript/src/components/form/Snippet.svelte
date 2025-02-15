<script>
  import { fade } from "svelte/transition"

  export let name
  export let value = ""
  export let ariaDescribedby = null
  export let ariaLabelledby = null

  let foundTerms = []
  let processing
  let snippetFixer = false
  let replacedMcCree = false

  function autofillForm() {
    if (processing) return

    processing = true
    foundTerms = []

    setTimeout(() => {
      setName("maps")
      setName("heroes")
      setNumberOfPlayers()

      setTimeout(() => { processing = false }, 500)
    })
  }

  function setName(name) {
    findValue(`enabled ${name}`, name, true)

    if (!foundTerms.includes(`enabled ${name}`)) findValue(`disabled ${name}`, name, false)
    if (!foundTerms.includes(`enabled ${name}`) && !foundTerms.includes(`disabled ${name}`)) {
      foundTerms = [...foundTerms, `all ${name}`]
      setCheckboxes(name, [], false)
    }
  }

  function findValue(term, name, initial) {
    const regex = new RegExp(`(${term}\\s+).*?(?=\\s+})`, "gs")

    let result = value.match(regex)
    if (result) {
      foundTerms = [...foundTerms, term]
      result = result.join("")
      result = result.replaceAll(`enabled ${name} {`, "").replace(/\t/g, "").replace(/\r/g, "")
      result = result.split("\n").filter(r => r)
    }

    setCheckboxes(name, result, initial)
  }

  function setCheckboxes(name, result, initial) {
    const elements = document.querySelectorAll(`[type="checkbox"][name*="${name}"]`)
    elements.forEach(element => {
      if (initial) element.checked = (!result || result.includes(element.value))
      if (!initial) element.checked = !(!result || result.includes(element.value))
    })
  }

  function setNumberOfPlayers() {
    let maxPlayersTeamOne = value.match(/(Max Team 1 Players:\s+).*?(?=\n)/gs)
    if (maxPlayersTeamOne) maxPlayersTeamOne = maxPlayersTeamOne[0].replace("Max Team 1 Players: ", "")

    let maxPlayersTeamTwo = value.match(/(Max Team 2 Players:\s+).*?(?=\n)/gs)
    if (maxPlayersTeamTwo) maxPlayersTeamTwo = maxPlayersTeamTwo[0].replace("Max Team 2 Players: ", "")

    const maxPlayers = parseInt(maxPlayersTeamOne) + parseInt(maxPlayersTeamTwo) || 12

    const slider = document.querySelector("[name*='number_of_supported_players']")
    if (slider) slider.noUiSlider.set([1, maxPlayers])

    foundTerms = [...foundTerms, "max players"]
  }

  function replaceMcCree() {
    if (value = value.replaceAll("McCree", "Cassidy")) {
      replacedMcCree = true
    }
  }
</script>

<textarea {name} bind:value class="form-input form-textarea form-textarea--small" aria-describedby={ariaDescribedby} aria-labelledby={ariaLabelledby}></textarea>

{#if value}
  <button
    transition:fade={{ duration: 150 }}
    on:click|preventDefault={autofillForm}
    class="button button--secondary mt-1/4"
    disabled={processing}>

    {processing ? "Processing..." : "Auto fill settings from snippet"}
  </button>
{/if}

{#if foundTerms.length}
  <div class="well well--dark block mt-1/4">
    {#each foundTerms as term, i}
      <div in:fade={{ duration: 150, delay: i * 150 }}>Set "{term}"</div>
    {/each}
  </div>
{/if}

{#if value}
  <div class="switch-checkbox mt-1/4">
    <input
      id="snippet-fixer"
      class="switch-checkbox__input"
      autocomplete="off"
      type="checkbox"
      bind:checked={snippetFixer}/>

    <label
      class="switch-checkbox__label"
      for="snippet-fixer">
      Show Snippet Fixer Options
    </label>
  </div>
{/if}

{#if snippetFixer}
  <div class="well well--dark mt-1/4">
    <button
      on:click|preventDefault={replaceMcCree}
      class="button {replacedMcCree ? "button--primary" : "button--secondary"}">
      {replacedMcCree ? "Successfully replaced McCree with Cassidy" : "Replace McCree with Cassidy"}
    </button>
  </div>
{/if}

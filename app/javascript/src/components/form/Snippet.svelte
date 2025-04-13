<script lang="ts">
  import { fade } from "svelte/transition"

  interface Props {
    name: any,
    value?: string,
    ariaDescribedby?: any,
    ariaLabelledby?: any
  }

  let {
    name,
    value = $bindable(""),
    ariaDescribedby = null,
    ariaLabelledby = null
  }: Props = $props()

  let foundTerms: string[] = $state([]) // This variable is used to let the user know what happened in simple terms. It isn't used for any actual processing.
  let processing = $state(false)

  function autofillForm(event: Event): void {
    event.preventDefault()

    if (processing) return

    foundTerms = []
    processing = true

    requestAnimationFrame(() => {
      setName("maps")
      setName("heroes")
      setNumberOfPlayers()

      setTimeout(() => { processing = false }, 500)
    })
  }

  function setName(name: string): void {
    let result = findAndCheckValue(`enabled ${name}`, name)

    if (!result.length) {
      result = findAndCheckValue(`disabled ${name}`, name, true)

      if (!result.length) {
        foundTerms = [...foundTerms, `all ${name}`]
        setCheckboxes(name, [], true)
      }
    }
  }

  function findAndCheckValue(term: string, name: string, invert = false): string[] {
    const regex = new RegExp(`(${term}\\s+).*?(?=\\s+})`, "gs")

    const match = value.match(regex)
    if (!match) return []

    const lines = match.join("")
      .replaceAll(`enabled ${name} {`, "")
      .replace(/[\t\r]/g, "")
      .split("\n").filter(r => r)

    setCheckboxes(name, lines, invert)

    foundTerms = [...foundTerms, term]

    return lines
  }

  /** @param invert This is used to invert the checkbox value of a found line. "enabled heroes" would not be inverted, "disabled heroes" would be. */
  function setCheckboxes(name: string, lines: string[], invert = false): void {
    const elements = Array.from(document.querySelectorAll(`[type="checkbox"][name*="${name}"]`)) as HTMLFormElement[]

    elements.forEach(element => {
      let value = !lines || lines.includes(element.value)
      if (invert) value = !value

      element.checked = value
    })
  }

  function setNumberOfPlayers(): void {
    const maxPlayersTeamOne = value.match(/(Max Team 1 Players:\s+).*?(?=\n)/gs)?.[0].replace("Max Team 1 Players: ", "") || "6"
    const maxPlayersTeamTwo = value.match(/(Max Team 2 Players:\s+).*?(?=\n)/gs)?.[0].replace("Max Team 2 Players: ", "") || "6"
    const maxPlayers = parseInt(maxPlayersTeamOne) + parseInt(maxPlayersTeamTwo)

    const sliderElement = document.querySelector("[name*='number_of_supported_players']")

    if (!(sliderElement && "noUiSlider" in sliderElement)) return

    // @ts-ignore
    sliderElement.noUiSlider.set([1, maxPlayers])

    foundTerms = [...foundTerms, "max players"]
  }
</script>

<textarea {name} bind:value class="form-input form-textarea form-textarea--small" aria-describedby={ariaDescribedby} aria-labelledby={ariaLabelledby}></textarea>

{#if value}
  <button
    transition:fade={{ duration: 150 }}
    onclick={autofillForm}
    class="button button--secondary mt-1/4"
    disabled={processing}>

    {processing ? "Processing..." : "Autofill settings from snippet"}
  </button>
{/if}

{#if foundTerms.length}
  <div class="well well--dark block mt-1/4">
    {#each foundTerms as term, i}
      <div in:fade|global={{ duration: 150, delay: i * 150 }}>Set "{term}"</div>
    {/each}
  </div>
{/if}

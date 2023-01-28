<script>
  import { items } from "../../stores/editor"
  import { setCurrentItemById } from "../../utils/editor"
  import { fade, fly } from "svelte/transition"
  import { tick } from "svelte"

  let active = false
  let value = ""
  let input

  $: if (active) focusInput()

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 66) {
      event.preventDefault()
      active = !active
      focusInput()
    }

    if (!active) return

    if (event.keyCode == 13) find() // Enter key
  }

  function find() {
    console.log("value", value)
  }

  async function focusInput() {
    await tick()
    input.focus()
  }
</script>

<svelte:window on:keydown={keydown} on:keydown={event => { if (event.key === "Escape") active = false }} />

<button class="form-input bg-darker text-dark cursor-pointer text-left" on:click={() => active = true}>
  <em>Find line... (Ctrl+B)</em>
</button>

{#if active}
  <div class="modal modal--top" transition:fade={{ duration: 100 }} data-ignore>
    <div class="modal__content" style="max-width: 600px" transition:fly={{ y: 100, duration: 200 }}>
      Received an in-game error pointing to a specific line? Enter the line number you received and this tool will attempt to find the matching line in the correct file. <em>Success not guaranteed.</em>

      <input type="text" class="form-input form-input--large bg-darker mt-1/4" placeholder="Find error by line..." bind:value bind:this={input} />

      {#if value}
        Value entered
      {/if}
    </div>

    <div class="modal__backdrop" on:click={() => active = false} />
  </div>
{/if}

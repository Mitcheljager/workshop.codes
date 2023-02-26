<script>
  import { fly } from "svelte/transition"
  import { compile } from "../../utils/compiler"
  import { copyValueToClipboard } from "../../copy"

  let compiling = false
  let copied = false

  function doCompile() {
    compiling = true

    try {
      const compiled = compile()

      setTimeout(() => {
        compiling = false
        copyToClipboard(compiled.result)
      }, 150)
    } catch (error) {
      console.log(error)
      alert(error)
      compiling = false
    }
  }

  function copyToClipboard(value) {
    copied = true

    copyValueToClipboard(value)

    setTimeout(() => copied = false, 1000)
  }

  function keydown(event) {
    if (event.ctrlKey && event.shiftKey && event.keyCode == 83) {
      event.preventDefault()
      doCompile()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<button class="button button--secondary button--square tooltip" on:click={doCompile}>
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


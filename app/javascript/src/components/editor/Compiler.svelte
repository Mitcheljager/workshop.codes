<script>
  import { compile } from "../../utils/compiler/compile"
  import { addAlert } from "../../lib/alerts"
  import { copyValueToClipboard } from "../../copy"

  export let inline = false

  let compiling = false
  let classes

  $: classes = [
    "tooltip",
    $$restProps["class"],
    !inline && "button button--secondary button--square"
  ].filter((c) => !!c).join(" ")

  function doCompile() {
    compiling = true

    try {
      const compiled = compile()

      setTimeout(() => {
        compiling = false
        copyToClipboard(compiled)
      }, 150)
    } catch (error) {
      console.log(error)
      alert(error)
      compiling = false
    }
  }

  function copyToClipboard(value) {
    copyValueToClipboard(value)

    addAlert("Copied compiled snippet to clipboard")
  }

  function keydown(event) {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyS") {
      event.preventDefault()
      doCompile()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<button
  class={classes}
  on:click={doCompile}>
  {#if compiling}
    Compiling...
  {:else}
    Compile
  {/if}
</button>


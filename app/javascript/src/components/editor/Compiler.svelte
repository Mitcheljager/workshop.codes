<script>
  import { fly } from "svelte/transition"
  import { compile } from "../../utils/compiler/compile"
  import { copyValueToClipboard } from "../../copy"

  export let inline = false

  let compiling = false
  let copied = false

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
    copied = true

    copyValueToClipboard(value)

    setTimeout(() => copied = false, 1000)
  }

  function keydown(event) {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyS") {
      event.preventDefault()
      doCompile()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<svelte:element
  this={inline ? "span" : "button"}
  class={inline ? "w-100" : "button button--secondary button--square tooltip"}
  on:click={doCompile}
>
  {#if inline && copied}
    Compiled and copied!
  {:else}
    {#if compiling}
      Compiling...
    {:else}
      Compile
    {/if}
  {/if}

  {#if copied && !inline}
    <div transition:fly={{ y: 5, duration: 150 }} class="tooltip__content bg-primary text-pure-white block">
      Copied to clipboard
    </div>
  {/if}
</svelte:element>


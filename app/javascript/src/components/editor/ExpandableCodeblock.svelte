<script>
  import Expand from "../icon/Expand.svelte"

  export let fullContentLines
  export let snippetLineCount = 3
  export let snippetHighlightedLineIndex = 0

  let expanded = false
  let snippetLines = []
  $: {
    snippetLines = []

    const snippetStartLineIdx = snippetHighlightedLineIndex + Math.max(0, Math.round(snippetLineCount / 2))
    console.log({ snippetStartLineIdx })
    for (let i = snippetStartLineIdx; i < snippetStartLineIdx + snippetLineCount; i++) {
      snippetLines.push(fullContentLines[i])
    }
  }

  function escapeLine(line) {
    return line.replaceAll(/\s/g, "&nbsp;").replaceAll(/\t/g, "&nbsp;&nbsp;")
  }
</script>

<style>
  .highlighted {
    background-color: rgba(255, 255, 0, 0.2);
  }

  .microlight {
    width: 100%;
  }
</style>

<div class="relative">
  <div class="absolute inline-block cursor-pointer top-0 right-0 p-1/16" on:click={() => expanded = true}>
    <Expand style="width: 15px; height: auto" />
  </div>
  <code class="block overflow-auto">
    {#each snippetLines as line, index}
      <div class="flex">
        {snippetHighlightedLineIndex + index}.&nbsp;<div class="microlight">{@html escapeLine(line || "")}</div>
      </div>
    {/each}
  </code>
</div>

{#if expanded}
<div class="modal modal--top" data-ignore>
  <div class="modal__content" style="min-width: 600px; max-width: initial">
    <div class="relative">
      <div class="absolute inline-block cursor-pointer top-0 right-0 p-1/16" on:click={() => expanded = false}>
        <Expand contract />
      </div>
      <code class="block overflow-auto">
        {#each fullContentLines as line, index}
          <div class="flex">
            {index}.&nbsp;<div class="microlight" class:highlighted={index === snippetHighlightedLineIndex}>{@html escapeLine(line || "")}</div>
          </div>
        {/each}
      </code>
    </div>
  </div>
</div>
{/if}

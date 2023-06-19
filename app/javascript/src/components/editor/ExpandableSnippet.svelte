<script>
  import { tick } from "svelte"
  import { reset as microlight } from "../../microlight"
  import Expand from "../icon/Expand.svelte"

  export let fullContentLines
  export let snippetLineCount = 3
  export let snippetHighlightedLineIndex = 0

  let expanded = false
  let snippetLines
  let snippetStartLineIdx

  $: {
    snippetStartLineIdx = snippetHighlightedLineIndex - Math.max(0, Math.floor(snippetLineCount / 2))
    snippetLines = getLines(snippetLineCount)
  }

  function getLines() {
    const lines = []

    for (let i = snippetStartLineIdx; i < snippetStartLineIdx + snippetLineCount; i++) {
      lines.push(fullContentLines[i])
    }

    return lines
  }

  async function syntaxHighlight() {
    await tick()
    microlight()
  }

  $: syntaxHighlight(expanded)

  function escapeLine(line) {
    return line.replaceAll(/\s/g, "&nbsp;").replaceAll(/\t/g, "&nbsp;&nbsp;")
  }
</script>

<div class="expandable-snippet relative">
  <div class="expandable-snippet__expand-button" on:click={() => expanded = true}>
    <Expand />
  </div>
  <code class="block overflow-auto">
    {#each snippetLines as line, index}
      <div class="flex">
        {snippetStartLineIdx + index}.&nbsp;<div class="microlight expandable-snippet__line">{@html escapeLine(line || "")}</div>
      </div>
    {/each}
  </code>
</div>

{#if expanded}
<div class="modal modal--top" data-ignore>
  <div class="modal__content expandable-snippet-modal" style="min-width: 600px; max-width: initial;">
    <div class="expandable-snippet relative">
      <div class="expandable-snippet__expand-button" on:click={() => expanded = false}>
        <Expand contract />
      </div>
      <div class="expandable-snippet__code overflow-auto">
        <code class="block">
          {#each fullContentLines as line, index}
            <div class="flex">
              {index}.&nbsp;<div class="microlight expandable-snippet__line" class:expandable-snippet__line--highlighted={index === snippetHighlightedLineIndex}>{@html escapeLine(line || "")}</div>
            </div>
          {/each}
        </code>
      </div>
    </div>
  </div>

  <div class="modal__backdrop" on:click={() => expanded = false} />
</div>
{/if}

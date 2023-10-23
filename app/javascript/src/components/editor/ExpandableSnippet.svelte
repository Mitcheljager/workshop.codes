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
  let expandedCodeElement

  $: {
    snippetStartLineIdx = snippetHighlightedLineIndex - Math.max(0, Math.floor(snippetLineCount / 2))
    snippetLines = getLines(snippetLineCount)
  }
  $: syntaxHighlight(expanded)
  $: if (expanded) scrollToHighlightedLine()

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

  async function scrollToHighlightedLine() {
    await tick()

    if (!expandedCodeElement) return

    const highlightedLineElement = expandedCodeElement.querySelector(".expandable-snippet__line--highlighted")
    if (!highlightedLineElement) return

    highlightedLineElement.scrollIntoViewIfNeeded()
  }

  function escapeLine(line) {
    return line.replaceAll(/\s/g, "&nbsp;").replaceAll(/\t/g, "&nbsp;&nbsp;")
  }
</script>

<div class="expandable-snippet relative">
  <button class="expandable-snippet__expand-button" on:click={() => expanded = true}>
    <Expand />
  </button>
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
      <button class="expandable-snippet__expand-button" on:click={() => expanded = false}>
        <Expand contract />
      </button>
      <div class="expandable-snippet__code overflow-auto">
        <code class="block" bind:this={expandedCodeElement}>
          {#each fullContentLines as line, index}
            <div class="flex">
              {index}.&nbsp;<div
                class="microlight expandable-snippet__line"
                class:expandable-snippet__line--highlighted={index === snippetHighlightedLineIndex}
              >{@html escapeLine(line || "")}</div>
            </div>
          {/each}
        </code>
      </div>
    </div>
  </div>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="modal__backdrop" on:click={() => expanded = false} />
</div>
{/if}

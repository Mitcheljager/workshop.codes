<script>
  import { onDestroy, onMount } from "svelte"
  import { getMostRecentFileFromDirectory } from "@utils/files"

  const supported = "showOpenFilePicker" in self

  let interval
  let entries = []
  let fileLastModified = null
  let directoryHandle = null
  let currentFileName = ""
  let fileTooLarge = false
  let infoHeight = 0
  let element

  onMount(() => {
    element.scroll(0, 10000)
  })

  onDestroy(() => {
    if (interval) clearInterval(interval)
  })

  async function openLogFile() {
    directoryHandle = await window.showDirectoryPicker()

    if (interval) clearInterval(interval)

    interval = setInterval(async() => {
      const mostRecentFile = await getMostRecentFileFromDirectory(directoryHandle)

      if (!mostRecentFile) return

      if (mostRecentFile.size > 1_000_000) {
        entries = []
        currentFileName = mostRecentFile.name
        fileTooLarge = true
        return
      }

      if (mostRecentFile.name !== currentFileName) {
        entries = []
        currentFileName = mostRecentFile.name
      }

      const text = await mostRecentFile.text()

      if (new Date(fileLastModified).getTime() === new Date(mostRecentFile.lastModifiedDate).getTime()) return

      fileLastModified = mostRecentFile.lastModifiedDate

      const lines = text.split(/\n/).filter(Boolean)
      entries = parseEntries(lines.slice(Math.max(lines.length - 100, 0))) // Last 100 entries
    }, 1000)
  }

  function parseEntries(entries) {
    const parsedEntries = []

    entries.forEach(entry => {
      const match = entry.match(/^\[(\d{2}:\d{2}:\d{2})\] (.*)$/)
      if (!match) return

      const [_, timestamp, content] = match
      parsedEntries.push({ timestamp, content })
    })

    return parsedEntries
  }
</script>

<div bind:clientHeight={infoHeight}>
  {#if supported}
    {#if !directoryHandle}
      <p>View inspector logs right from your browser, allowing you to more easily copy over values from the Workshop.</p>
      <p>Use "Log To Inspector" to have the log appear here.</p>
      <p>Make sure you have enabled "Enable Workshop Inspector Log File" in your Overwatch settings under "Settings &gt; Gameplay &gt; General &gt; Custom Games - Workshop".</p>
    {/if}

    <button class="button button--square w-100" class:button--dark={directoryHandle} on:click={openLogFile}>
      {directoryHandle ? "Change Workshop Log Directory" : "Select Workshop Log Directory"}
    </button>
  {:else}
    <div class="warning br-1 mt-0">Your browser does not support this feature. Sorry :&#40;</div>
  {/if}

  {#if directoryHandle}
    {#if currentFileName}
      <p><em>Watching for logs in file "{directoryHandle.name}/{currentFileName}"</em></p>

      {#if fileTooLarge}
        <div class="warning br-1 mt-0">The log file is too large. Are you sure you selected the correct directory?</div>
      {/if}
    {:else}
      <p><em>Watching for files in "{directoryHandle.name}"</em></p>
    {/if}
  {/if}
</div>

<div class="logs" style:--offset="{infoHeight}px" bind:this={element}>
  <div class="logs__scroller">
    {#each entries as { timestamp, content }}
      <div class="log">
        <div class="log__timestamp">{timestamp}</div>
        <div class="log__content">{content}</div>
      </div>
    {/each}
  </div>

  <div class="logs__anchor" />
</div>

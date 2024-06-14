<script>
  import { onDestroy } from "svelte"
  import EnhanceAudio from "@components/Enhance/EnhanceAudio.svelte"
  import { slide } from "svelte/transition"

  const supported = "showOpenFilePicker" in self
  const components = {
    audio: EnhanceAudio
  }

  let interval
  let enhanceItems = []
  let fileLastModified = null
  let currentFileName = ""

  onDestroy(() => {
    if (interval) clearInterval(interval)
  })

  async function openLogFile() {
    const directoryHandle  = await window.showDirectoryPicker()

    if (interval) clearInterval(interval)

    interval = setInterval(async() => {
      let mostRecentFile = null
      let mostRecentDate = new Date(0)

      for await (const entry of directoryHandle.values()) {
        if (entry.kind === "file") {
          const fileHandle = await directoryHandle.getFileHandle(entry.name)
          const file = await fileHandle.getFile()

          if (file.lastModifiedDate > mostRecentDate) {
            mostRecentDate = file.lastModifiedDate
            mostRecentFile = file
          }
        }
      }

      if (!mostRecentFile) return

      if (mostRecentFile.name !== currentFileName) {
        enhanceItems = []
        currentFileName = mostRecentFile.name
      }

      const text = await mostRecentFile.text()

      if (new Date(fileLastModified).getTime() === new Date(mostRecentFile.lastModifiedDate).getTime()) return

      fileLastModified = mostRecentFile.lastModifiedDate

      const allItems = extractItems(text)
      const newItems = []
      for (let i = 0; i < Math.min(allItems.length, 1000); i++) {
        const currentIdIndex = enhanceItems.findIndex(j => j.id === allItems[i].id)

        if (currentIdIndex >= 0) {
          enhanceItems[currentIdIndex] = allItems[i]
          continue
        }

        const newIdIndex = newItems.findIndex(j => j.id === allItems[i].id)
        if (newIdIndex >= 0) newItems[newIdIndex] = allItems[i]
        else newItems.push(allItems[i])
      }

      enhanceItems = [...newItems, ...enhanceItems]
    }, 100)
  }

  function extractItems(text) {
    const regex = /\[WCEnhance (.*?)\](.*?)\[\/WCEnhance\]/gs
    let matches
    const results = []

    while ((matches = regex.exec(text)) !== null) {
      const properties = JSON.parse(matches[1])

      // Remove timestamps
      const contentLines = matches[2]
        .split("\n")
        .map(line => line.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, "").trim())
        .filter(line => line.length > 0)

      // Parse each line into an object
      const content = {}
      contentLines.forEach(line => {
        const [key, value] = line.split(": ").map(s => s.trim())
        content[key] = !value || isNaN(value) ? value : parseFloat(value)

        return content
      })

      results.push({ ...properties, content })
    }

    return results
  }
</script>

<div class="standout text-left">
  {#if supported}
    <button class="button" on:click={openLogFile}>Open Workshop Log file</button>
  {:else}
    <div class="warning warning--error mt-0">You browser does not support being a host, but you can still join as a client.</div>
  {/if}

  <div class="mt-1/2">
    Enhance!
  </div>

  {#each enhanceItems as { id, type, ...rest } (id)}
    <div class="well well--dark mt-1/8" in:slide={{ duration: 200 }}>
      <div>Enhance received with type "{type}"</div>
      <div>{JSON.stringify(rest.content)}</div>

      {#if components[type]}
        <svelte:component this={components[type]} {...rest} />
      {/if}
    </div>
  {/each}
</div>

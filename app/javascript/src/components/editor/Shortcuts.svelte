<script>
  import { escapeable } from "../actions/escapeable"
  import { outsideClick } from "../actions/outsideClick"
  import Keyboard from "../icon/Keyboard.svelte"
  import { fly } from "svelte/transition"

  let active = false

  const shortcuts = [
    { keys: ["Ctrl", "S"], text: "Save" },
    { keys: ["Ctrl", "Shift", "S"], text: "Compile" },
    { keys: ["Ctrl", "Space"], text: "Show autocomplete suggestions" },
    { keys: ["Ctrl", "Z"], text: "Undo" },
    { keys: ["Ctrl", "Y"], text: "Redo" },
    { keys: ["Ctrl", "Shift", "Z"], text: "Redo" },
    { keys: ["Ctrl", "C"], text: "Copy current line or selection" },
    { keys: ["Ctrl", "X"], text: "Cut current line or selection" },
    { keys: ["Ctrl", "F"], text: "Search/replace" },
    { keys: ["Ctrl", "Shift", "F"], text: "Search/replace in all files" },
    { keys: ["Alt", "Click"], text: "Search wiki for keyword" },
    { keys: ["Ctrl", "Q"], text: "Find by name" },
    { keys: ["Ctrl", "Click"], text: "Create additional cursor" },
    { keys: ["Ctrl", "D"], text: "Add selection to next occurance" },
    { keys: ["Ctrl", "Shift", "L"], text: "Select all occurances" },
    { keys: ["Ctrl", "Shift", "K"], text: "Remove current line" },
    { keys: ["Ctrl", "/"], text: "Comment/uncomment current line" },
    { keys: ["Alt", "↑"], text: "Move current line up" },
    { keys: ["Alt", "↓"], text: "Move current line down" },
    { keys: ["Ctrl", "1"], text: "Focus files list" },
    { keys: ["Ctrl", "2"], text: "Focus editor" },
    { keys: ["Ctrl", "3"], text: "Focus wiki search" }
  ]
</script>

<div class="dropdown shortcuts settings" use:outsideClick on:outsideClick={() => active = false}>
  <button class="button button--secondary button--square" on:click|stopPropagation={() => active = !active}>
    <Keyboard />
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} use:escapeable on:escape={() => active = false} class="dropdown__content block p-1/4" style="width: 400px">
      <h5 class="mt-0 mb-1/8">Keyboard shortcuts</h5>

      {#each shortcuts as { keys, text }}
        <div class="shortcut">
          <div>
            {@html keys.map(key => `<kbd>${key}</kbd>`).join(" + ")}
          </div>
          { text }
        </div>
      {/each}
    </div>
  {/if}
</div>

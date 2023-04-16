<script>
  import EditorItemCreate from "./EditorItemCreate.svelte"
  import EditorList from "./EditorList.svelte"
  import { items } from "../../stores/editor"

  let element

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 49) {
      event.preventDefault()
      element.focus()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<div class="flex align-center justify-between pl-1/4 pr-1/4 pb-1/8">
  <strong>Items</strong>
  <EditorItemCreate />
</div>

<div bind:this={element} tabindex="0">
  <EditorList />

  {#if !$items?.length}
    <p class="mt-0 mb-0 pl-1/4 pr-1/4 small text-dark"><em>Start by creating a new item using the button below.</em></p>
  {/if}
</div>

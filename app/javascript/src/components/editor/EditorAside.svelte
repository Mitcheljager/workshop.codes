<script>
  import EditorItemCreate from "@components/editor/EditorItemCreate.svelte"
  import EditorList from "@components/editor/EditorList.svelte"
  import { items } from "@stores/editor"

  let element

  function keydown(event) {
    if (event.ctrlKey && event.key === "1") {
      event.preventDefault()
      element.focus()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<div class="pl-1/4 pr-1/4 pb-1/8">
  <strong>Items</strong>
</div>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<div bind:this={element} tabindex="0">
  <EditorList />

  {#if !$items?.length}
    <p class="mt-0 mb-0 pl-1/4 pr-1/4 small text-dark"><em>Start by creating a new item using the button below.</em></p>
  {/if}

  <div class="item-list__add-item">
    <EditorItemCreate>
      <span class="button button--secondary w-100 button--square">Add</span>
    </EditorItemCreate>
  </div>
</div>

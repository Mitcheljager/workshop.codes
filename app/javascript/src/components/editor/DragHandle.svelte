<script>
  import { onMount } from "svelte"
  import { setCssVariable } from "../../utils/editor"

  export let key = ""
  export let currentSize = 0
  export let align = "right"

  let isDragging = false

  let startX = 0
  let startSize = currentSize

  onMount(() => {
    currentSize = localStorage.getItem(key) || currentSize
    setCssVariable(key, `${ currentSize }px`)
  })

  function mouseDown(event) {
    isDragging = true
    startX = event.pageX
    startSize = parseInt(currentSize)
  }

  function mouseMove(event) {
    if (!isDragging) return

    const difference = event.pageX - startX
    currentSize = startSize + difference * (align == "right" ? 1 : -1)

    setCssVariable(key, `${ currentSize }px`)

    localStorage.setItem(key, currentSize)
  }

  function mouseUp() {
    if (!isDragging) return
    isDragging = false
  }
</script>

<svelte:window on:mousemove={mouseMove} on:mouseup={mouseUp} />

<button class="drag-handle drag-handle--{ align }" class:is-dragging={isDragging} on:mousedown={mouseDown} />

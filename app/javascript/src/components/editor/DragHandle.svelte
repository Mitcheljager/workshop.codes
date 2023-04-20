<script>
  import { onMount } from "svelte"
  import { setCssVariable } from "../../utils/editor"
  import { isMobile } from "../../stores/editor"

  export let key = ""
  export let currentSize = 0
  export let align = "right"

  let isDragging = false

  let startPosition = 0
  let startSize = currentSize

  $: direction = $isMobile ? "pageY" : "pageX"

  onMount(() => {
    currentSize = Math.max(Math.min(localStorage.getItem(key) || currentSize, Math.max(window.innerWidth, window.innerHeight)), 0)
    setCssVariable(key, `${ currentSize }px`)
  })

  function mouseDown(event) {
    isDragging = true
    startPosition = event[direction] || event.targetTouches[0]?.[direction]
    startSize = parseInt(currentSize)
  }

  function mouseMove(event) {
    if (!isDragging) return

    const difference = (event[direction] || event.targetTouches[0]?.[direction]) - startPosition
    currentSize = startSize + difference * (align == "right" ? 1 : -1)

    setCssVariable(key, `${ currentSize }px`)

    localStorage.setItem(key, currentSize)
  }

  function mouseUp() {
    if (!isDragging) return
    isDragging = false
  }
</script>

<svelte:window on:mousemove={mouseMove} on:touchmove={mouseMove} on:mouseup={mouseUp} on:touchend={mouseUp} />

<button class="drag-handle drag-handle--{ align }" class:is-dragging={isDragging} on:mousedown={mouseDown} on:touchstart={mouseDown} />

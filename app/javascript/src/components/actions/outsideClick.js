export function outsideClick(node) {
  function click(event) {
    if (node.contains(event.target)) return

    node.dispatchEvent(new CustomEvent("outsideClick"))
  }

  window.addEventListener("click", click, {
    passive: true,
    capture: true // needed so the event fires before other event handlers prevent it from doing so
  })

  return {
    destroy() {
      window.removeEventListener("click", click)
    }
  }
}

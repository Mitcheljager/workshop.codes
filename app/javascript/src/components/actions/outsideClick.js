export function outsideClick(node) {
  function click(event) {
    if (node.contains(event.target)) return

    node.dispatchEvent(new CustomEvent("outsideClick"))
  }

  window.addEventListener("click", click, { passive: true })

  return {
    destroy() {
      window.removeEventListener("click", click)
    }
  }
}

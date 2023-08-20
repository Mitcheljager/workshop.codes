export function escapeable(node) {
  function keydown(event) {
    if (event.code !== "Escape") return

    node.dispatchEvent(new CustomEvent("escape"))
  }

  window.addEventListener("keydown", keydown, { passive: true })

  return {
    destroy() {
      window.removeEventListener("keydown", keydown)
    }
  }
}

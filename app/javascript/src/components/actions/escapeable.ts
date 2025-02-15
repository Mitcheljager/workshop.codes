import type { Action } from "svelte/action"

export const escapeable: Action<Node, { onescape?: () => void }> = (node, { onescape = () => null } = {}) => {
  function keydown(event: KeyboardEvent): void {
    if (event.code !== "Escape") return

    onescape()

    node.dispatchEvent(new CustomEvent("escape"))
  }

  window.addEventListener("keydown", keydown, { passive: true })

  return {
    destroy() {
      window.removeEventListener("keydown", keydown)
    }
  }
}

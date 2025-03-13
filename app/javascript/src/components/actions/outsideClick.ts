import type { Action } from "svelte/action"

export const outsideClick: Action<Node, { onOutsideClick?: () => void }> = (node, { onOutsideClick = () => null } = {}) => {
  function click(event: MouseEvent): void {
    if (event.target instanceof Node && node.contains(event.target)) return

    onOutsideClick()

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

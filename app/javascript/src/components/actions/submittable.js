
export function submittable(node) {
  const nodeIsInput = node.tagName === "INPUT"
  const nodeIsTextarea = node.tagName === "TEXTAREA"

  if (!(nodeIsInput || nodeIsTextarea)) {
    throw new Error("submittable action is only meant to be used on inputs")
  }

  function keydown(event) {
    if (event.code !== "Enter") return
    if (nodeIsTextarea && (event.metaKey || event.altKey || event.shiftKey || event.ctrlKey)) return

    event.preventDefault()

    node.dispatchEvent(new CustomEvent("submit"))
  }

  window.addEventListener("keydown", keydown)

  return {
    destroy() {
      window.removeEventListener("keydown", keydown)
    }
  }
}

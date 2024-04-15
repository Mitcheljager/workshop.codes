export function bind() {
  const elements = document.querySelectorAll("[data-action='expand-content']")
  elements.forEach(element => element.removeAndAddEventListener("click", expandContent))
}

function expandContent({ target }) {
  const parent = target.closest("[data-expandable-content]")

  console.log("expand", parent)

  if (!parent) return

  parent.classList.add("expanded")
}

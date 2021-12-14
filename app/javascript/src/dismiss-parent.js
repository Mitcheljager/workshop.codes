export function destroy() {
  const elements = document.querySelectorAll("[data-role~='dismiss-parent']")

  elements.forEach((element) => element.parentNode.remove())
}

export function bind() {
  const elements = document.querySelectorAll("[data-role~='dismiss-parent']")

  elements.forEach((element) => element.removeAndAddEventListener("click", dismissParent))
}

function dismissParent(event) {
  const parent = this.parentNode
  parent.classList.add("fade-out")
  setTimeout(() => {
    parent.remove()
  }, 500)
  event.preventDefault()
}

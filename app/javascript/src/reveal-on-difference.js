export function bind() {
  const elements = document.querySelectorAll("[data-action='reveal-on-difference']")

  elements.forEach((element) => element.removeAndAddEventListener("input", toggleRevealOnDifference))
}

function toggleRevealOnDifference() {
  const value = this.value
  const original = this.dataset.original
  const different = value !== original && original !== undefined

  const elements = document.querySelectorAll("[data-role='reveal-on-difference']")

  elements.forEach(element => element.style.display = different ? "block" : "none")
}

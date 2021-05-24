export function bind() {
  const elements = document.querySelectorAll("[data-action='reveal-by-checkbox']")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleRevealByCheckbox))
}

function toggleRevealByCheckbox(event) {
  const state = this.checked
  const parent = this.closest("[data-reveal-by-checkbox]")
  const target = parent.dataset.revealByCheckbox

  const elements = parent.querySelectorAll(target == "" ? "[data-role='hidden-by-checkbox']" : `[data-role="hidden-by-checkbox"][data-target="${ target }"]`)

  elements.forEach(element => element.style.display = state ? "initial" : "none")
}

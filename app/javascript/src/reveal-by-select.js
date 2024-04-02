export function bind() {
  const elements = document.querySelectorAll("[data-action~='reveal-by-select']")

  elements.forEach((element) => element.removeAndAddEventListener("input", toggleRevealBySelect))
}

function toggleRevealBySelect() {
  const parent = this.closest("[data-reveal-by-select-parent]")
  const target = parent.querySelector(`[data-reveal-by-select-target="${this.value}"]`)
  const elements = parent.querySelectorAll("[data-reveal-by-select-target]")

  elements.forEach(element => element.classList.add("visibility-hidden"))
  if (target) target.classList.remove("visibility-hidden")
}

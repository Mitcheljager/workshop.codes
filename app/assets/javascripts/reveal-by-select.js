document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='reveal-by-select']")

  elements.forEach((element) => element.removeEventListener("input", toggleRevealBySelect))
  elements.forEach((element) => element.addEventListener("input", toggleRevealBySelect))
})

function toggleRevealBySelect(event) {
  const parent = this.closest("[data-reveal-by-select-parent]")
  const target = parent.querySelector(`[data-reveal-by-select-target="${ this.value }"]`)
  const elements = parent.querySelectorAll("[data-reveal-by-select-target]")

  elements.forEach(element => element.classList.add("visibility-hidden"))
  target.classList.remove("visibility-hidden")
}

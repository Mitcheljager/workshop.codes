document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='reveal-by-checkbox']")

  elements.forEach((element) => element.removeEventListener("click", toggleRevealByCheckbox))
  elements.forEach((element) => element.addEventListener("click", toggleRevealByCheckbox))
})

function toggleRevealByCheckbox(event) {
  const state = this.checked
  const parent = this.closest("[data-reveal-by-checkbox]")

  const elements = parent.querySelectorAll("[data-role='hidden-by-checkbox']")
  
  elements.forEach(element => element.style.display = state ? "initial" : "none")
}

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='toggle-content']")

  elements.forEach((element) => element.removeEventListener("click", toggleContent))
  elements.forEach((element) => element.addEventListener("click", toggleContent))
})

function toggleContent(event) {
  event.preventDefault()

  const parent = this.closest("[data-toggle-content]")

  const element = parent.querySelector("[data-role='content-to-toggle']")
  const state = window.getComputedStyle(element).display === "none"

  element.style.display = state ? "initial" : "none"
}

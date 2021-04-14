document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='apply-custom-css']")

  elements.forEach((element) => element.removeAndAddEventListener("input", applyCustomCSS))
})

function applyCustomCSS(event) {
  const value = this.value
  const styleTag = document.querySelector("#custom-css")

  styleTag.innerHTML = value
}

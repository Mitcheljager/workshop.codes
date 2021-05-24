export function bind() {
  const elements = document.querySelectorAll("[data-action~='set-gallery']")
  elements.forEach(element => element.removeAndAddEventListener("click", setGallery))
}

function setGallery(event) {
  const target = document.querySelector(`[data-gallery="${ this.dataset.target }"]`)

  if (target) {
    target.src = ""
    target.src = this.dataset.url
  }
}

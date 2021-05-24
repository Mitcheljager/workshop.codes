export function bind() {
  const elements = document.querySelectorAll("[data-action~='image-preview']")
  elements.forEach(element => element.removeAndAddEventListener("change", setImagePreview))
}

function setImagePreview(event) {
  const target = document.querySelector(`[data-image-preview="${ this.dataset.target }"]`)

  if (!this.files && !this.files[0]) return

  const reader = new FileReader()

  reader.onload = event => {
    target.src = event.target.result
  }

  reader.readAsDataURL(this.files[0])
}

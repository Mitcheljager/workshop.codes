document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='image-preview']")
  elements.forEach(element => element.removeEventListener("change", setImagePreview))
  elements.forEach(element => element.addEventListener("change", setImagePreview))
})

function setImagePreview(event) {
  const target = document.querySelector(`[data-image-preview="${ this.dataset.target }"]`)

  if (!this.files && !this.files[0]) return

  const reader = new FileReader()

  reader.onload = event => {
    target.src = event.target.result
  }

  reader.readAsDataURL(this.files[0])
}

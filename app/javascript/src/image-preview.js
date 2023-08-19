export function bind() {
  const fileUploadFields = document.querySelectorAll("[data-action~='image-preview']")
  fileUploadFields.forEach(element => element.removeAndAddEventListener("change", setImagePreview))

  const clearButtons = document.querySelectorAll("[data-action~='clear-image']")
  clearButtons.forEach(element => element.removeAndAddEventListener("click", clearImage))
}

function setImagePreview(event) {
  const removeFileFlag = document.querySelector(`[data-clear-image-flag="${ this.dataset.target }"]`)
  const target = document.querySelector(`[data-image-preview="${ this.dataset.target }"]`)

  if (!this.files && !this.files[0]) return

  const reader = new FileReader()

  reader.onload = event => {
    target.src = event.target.result
  }

  reader.readAsDataURL(this.files[0])
  removeFileFlag.value = ""
}

function clearImage(event) {
  const preview = document.querySelector(`[data-image-preview="${ this.dataset.target }"]`)
  const field = document.querySelector(`[data-action~="image-preview"][data-target="${ this.dataset.target }"]`)
  const removeFileFlag = document.querySelector(`[data-clear-image-flag="${ this.dataset.target }"]`)

  preview.src = ""
  field.value = ""
  removeFileFlag.value = "true"
}

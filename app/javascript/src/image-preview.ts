export function bind() {
  const fileUploadFields = document.querySelectorAll("[data-action~='image-preview']")
  fileUploadFields.forEach(element => element.removeAndAddEventListener("change", setImagePreview))

  const clearButtons = document.querySelectorAll("[data-action~='clear-image']")
  clearButtons.forEach(element => element.removeAndAddEventListener("click", clearImage))
}

function setImagePreview({ target }: { target: HTMLFormElement }) {
  const removeFileFlag = document.querySelector(`[data-clear-image-flag="${target.dataset.target}"]`) as HTMLFormElement
  const targetImage = document.querySelector(`[data-image-preview="${target.dataset.target}"]`) as HTMLImageElement

  if (!targetImage) return
  if (!target.files && !target.files[0]) return

  const reader = new FileReader()

  reader.onload = event => {
    if (event.target?.result) targetImage.src = event.target.result.toString()
  }

  reader.readAsDataURL(target.files[0])
  removeFileFlag.value = ""
}

function clearImage({ currentTarget }: { currentTarget: HTMLElement }) {
  const preview = document.querySelector(`[data-image-preview="${currentTarget.dataset.target}"]`) as HTMLImageElement
  const field = document.querySelector(`[data-action~="image-preview"][data-target="${currentTarget.dataset.target}"]`) as HTMLInputElement
  const removeFileFlag = document.querySelector(`[data-clear-image-flag="${currentTarget.dataset.target}"]`) as HTMLInputElement

  preview.src = ""
  field.value = ""
  removeFileFlag.value = "true"
}

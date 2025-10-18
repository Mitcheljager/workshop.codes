export function bind(): void {
  const fileUploadFields = document.querySelectorAll("[data-action~='image-preview']")
  fileUploadFields.forEach(element => element.removeAndAddEventListener("change", setImagePreview))

  const clearButtons = document.querySelectorAll("[data-action~='clear-image']")
  clearButtons.forEach(element => element.removeAndAddEventListener("click", clearImage))
}

function setImagePreview({ target }: { target: HTMLFormElement }): void {
  const removeFileFlag = document.querySelector<HTMLFormElement>(`[data-clear-image-flag="${target.dataset.target}"]`)!
  const targetImage = document.querySelector<HTMLImageElement>(`[data-image-preview="${target.dataset.target}"]`)!

  if (!target.files && !target.files[0]) return

  const reader = new FileReader()

  reader.onload = event => {
    if (event.target?.result) targetImage.src = event.target.result.toString()
  }

  reader.readAsDataURL(target.files[0])
  removeFileFlag.value = ""
}

function clearImage({ currentTarget }: { currentTarget: HTMLElement }): void {
  const preview = document.querySelector<HTMLImageElement>(`[data-image-preview="${currentTarget.dataset.target}"]`)!
  const field = document.querySelector<HTMLInputElement>(`[data-action~="image-preview"][data-target="${currentTarget.dataset.target}"]`)!
  const removeFileFlag = document.querySelector<HTMLInputElement>(`[data-clear-image-flag="${currentTarget.dataset.target}"]`)!

  preview.src = ""
  field.value = ""
  removeFileFlag.value = "true"
}

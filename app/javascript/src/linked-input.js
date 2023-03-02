export function bind() {
  const elements = document.querySelectorAll("[data-role~='linked-input']")

  if (!elements?.length) return

  elements.forEach(element => {
    element.removeAndAddEventListener("blur", updateLinkedInputs)
  })
}

function updateLinkedInputs(event) {
  const key = event.target.dataset.key

  const elements = document.querySelectorAll(`[data-key="${ key }"]`)

  elements.forEach(element => {
    element.value = event.target.value
  })
}

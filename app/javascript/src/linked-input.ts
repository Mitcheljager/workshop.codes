export function bind(): void {
  const elements = document.querySelectorAll("[data-role~='linked-input']")

  if (!elements?.length) return

  elements.forEach(element => {
    element.removeAndAddEventListener("blur", updateLinkedInputs)
  })
}

function updateLinkedInputs(event: Event): void {
  const currentTarget = event.currentTarget as HTMLInputElement
  const key = currentTarget.dataset.key

  const elements = Array.from(document.querySelectorAll(`[data-key="${key}"]`)) as HTMLInputElement[]

  elements.forEach(element => {
    element.value = currentTarget.value
  })
}

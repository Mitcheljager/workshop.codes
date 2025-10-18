export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='disable-by-select']")

  elements.forEach((element) => element.removeAndAddEventListener("input", updateFormSubmitButton))
}

function updateFormSubmitButton({ target: { value } }: { target: { value: string } }): void {
  const target = document.querySelector<HTMLFormElement>(`[data-disable-by-select-target="${value}"]`)
  const elements = Array.from(document.querySelectorAll<HTMLFormElement>("[data-disable-by-select-target]"))

  elements.forEach(element => element.disabled = false)
  if (target) target.disabled = true
}

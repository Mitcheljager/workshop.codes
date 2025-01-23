export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='disable-by-select']")

  elements.forEach((element) => element.removeAndAddEventListener("input", updateFormSubmitButton))
}

function updateFormSubmitButton({ target: { value } }: { target: { value: string } }): void {
  const target = document.querySelector(`[data-disable-by-select-target="${value}"]`) as HTMLFormElement
  const elements = Array.from(document.querySelectorAll("[data-disable-by-select-target]")) as HTMLFormElement[]

  elements.forEach(element => element.disabled = false)
  if (target) target.disabled = true
}

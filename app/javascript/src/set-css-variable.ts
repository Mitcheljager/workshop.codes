export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='set-css-variable']")

  elements.forEach(element => {
    element.removeAndAddEventListener("input", setCssVariable)
  })
}

export default function setCssVariable(event: InputEvent): void {
  event.preventDefault()

  const currentTarget = event.currentTarget as HTMLFormElement
  const targetElement = document.querySelector(`[data-css-variable="${currentTarget.dataset.target}"]`) as HTMLElement

  if (targetElement) targetElement.style.setProperty(`--${currentTarget.dataset.variable}`, currentTarget.value + "px")
}

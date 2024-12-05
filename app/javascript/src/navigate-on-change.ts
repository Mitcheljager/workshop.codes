export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='navigate-on-change']")

  elements.forEach((element) => element.removeAndAddEventListener("change", navigateOnChange))
}

function navigateOnChange(event: InputEvent): void {
  const target = event.target as HTMLSelectElement
  window.location.href = target.value
}

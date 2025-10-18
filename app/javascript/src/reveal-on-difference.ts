export function bind(): void {
  const elements = document.querySelectorAll("[data-action='reveal-on-difference']")

  elements.forEach((element) => element.removeAndAddEventListener("input", toggleRevealOnDifference))
}

function toggleRevealOnDifference({ currentTarget }: { currentTarget: HTMLFormElement }): void {
  const value = currentTarget.value
  const original = currentTarget.dataset.original
  const different = value !== original && original !== undefined

  const elements = Array.from(document.querySelectorAll<HTMLElement>("[data-role='reveal-on-difference']"))

  elements.forEach(element => element.style.display = different ? "block" : "none")
}

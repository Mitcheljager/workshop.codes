export function bind() {
  const elements = document.querySelectorAll("[data-action='reveal-on-difference']")

  elements.forEach((element) => element.removeAndAddEventListener("input", toggleRevealOnDifference))
}

function toggleRevealOnDifference({ currentTarget }: { currentTarget: HTMLFormElement }) {
  const value = currentTarget.value
  const original = currentTarget.dataset.original
  const different = value !== original && original !== undefined

  const elements = Array.from(document.querySelectorAll("[data-role='reveal-on-difference']")) as HTMLElement[]

  elements.forEach(element => element.style.display = different ? "block" : "none")
}

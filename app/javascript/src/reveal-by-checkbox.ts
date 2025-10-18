export function bind(): void {
  const elements = document.querySelectorAll("[data-action='reveal-by-checkbox']")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleRevealByCheckbox))
}

function toggleRevealByCheckbox({ currentTarget }: { currentTarget: HTMLFormElement }): void {
  const state = currentTarget.checked
  const parent = currentTarget.closest<HTMLElement>("[data-reveal-by-checkbox]")
  const target = parent?.dataset.revealByCheckbox

  const selector = target == "" ? "[data-role='hidden-by-checkbox']" : `[data-role="hidden-by-checkbox"][data-target="${target}"]`
  const elements = Array.from(parent?.querySelectorAll<HTMLElement>(selector) || [])

  elements.forEach((element: HTMLElement) => element.style.display = state ? (element.dataset.initialDisplay || "initial") : "none")
}

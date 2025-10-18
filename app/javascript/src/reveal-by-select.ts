export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='reveal-by-select']")

  elements.forEach((element) => element.removeAndAddEventListener("input", toggleRevealBySelect))
}

function toggleRevealBySelect({ currentTarget }: { currentTarget: HTMLFormElement }): void {
  const parent = currentTarget.closest("[data-reveal-by-select-parent]") as HTMLElement
  const target = parent?.querySelector(`[data-reveal-by-select-target="${currentTarget.value}"]`)
  const elements = Array.from(parent.querySelectorAll<HTMLElement>("[data-reveal-by-select-target]"))

  elements.forEach(element => element.classList.add("visibility-hidden"))
  if (target) target.classList.remove("visibility-hidden")
}

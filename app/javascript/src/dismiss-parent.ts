export function destroy(): void {
  const elements = Array.from(document.querySelectorAll("[data-role~='dismiss-parent']")) as HTMLElement[]

  elements.forEach((element) => element.parentNode?.removeChild(element))
}

export function bind(): void {
  const elements = document.querySelectorAll("[data-role~='dismiss-parent']")

  elements.forEach((element) => element.removeAndAddEventListener("click", dismissParent))
}

export function dismissParent(event: Event): void {
  const currentTarget = event.currentTarget as HTMLElement
  const parent = currentTarget?.parentNode as HTMLElement

  parent.classList.add("fade-out")
  setTimeout(() => {
    parent.remove()
  }, 500)

  event.preventDefault()
}

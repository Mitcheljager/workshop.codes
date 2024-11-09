export function destroy() {
  const elements = Array.from(document.querySelectorAll("[data-role~='dismiss-parent']")) as HTMLElement[]

  elements.forEach((element) => element.parentNode?.removeChild(element))
}

export function bind() {
  const elements = document.querySelectorAll("[data-role~='dismiss-parent']")

  elements.forEach((element) => element.removeAndAddEventListener("click", dismissParent))
}

export function dismissParent(event: Event) {
  const currentTarget = event.currentTarget as HTMLElement
  const parent = currentTarget?.parentNode as HTMLElement

  if (!parent) return

  parent.classList.add("fade-out")
  setTimeout(() => {
    parent.remove()
  }, 500)

  event.preventDefault()
}
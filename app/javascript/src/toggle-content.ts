export function bind(): void {
  document.body.removeAndAddEventListener("click", toggleContent)
}

function toggleContent(event: MouseEvent): void {
  let target = event.target as HTMLElement

  if (target.dataset.action === undefined || !target.dataset.action.includes("toggle-content")) {
    target = target.closest("[data-action~='toggle-content']") as HTMLElement
  }

  if (!target || target.dataset.action === undefined) return
  if (!target.dataset.action.includes("toggle-content")) return

  event.preventDefault()

  const parent = target.closest<HTMLElement>("[data-toggle-content]")!
  const element = parent.querySelector<HTMLElement>("[data-role~='content-to-toggle']")!
  const state = window.getComputedStyle(element).display === "none"
  const datasetTiming = parseInt(target.dataset.animationTiming || "0")
  const animationTiming = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : datasetTiming > 0 ? datasetTiming : 0

  if (!state) {
    target.classList.remove("active")
    parent.classList.add("fading-out")
    target.ariaExpanded = "false"

    if (target.dataset.hideWith) target.textContent = target.dataset.hideWith
  } else {
    target.classList.add("active")
    target.ariaExpanded = "true"

    if (animationTiming > 0) element.style.display = "initial"

    parent.classList.add("fading-in")

    if (target.dataset.showWith) target.textContent = target.dataset.showWith
    if (parent.dataset.closeOnOutsideClick !== undefined) document.body.removeAndAddEventListener("click", closeOnOutsideClick)
  }

  setTimeout(() => {
    element.style.display = state ? "initial" : "none"
    parent.classList.remove("fading-out")
    parent.classList.remove("fading-in")
  }, animationTiming)
}

function closeOnOutsideClick(event: MouseEvent): void {
  const target = event.target as HTMLElement

  if (target.closest("[data-toggle-content]")) return
  if (target.nodeName === "INPUT") return

  const activeElement = document.querySelector("[data-toggle-content] .active")
  if (!activeElement) return

  // @ts-ignore
  toggleContent({ target: activeElement, preventDefault: () => null })
  document.body.removeEventListener("click", closeOnOutsideClick)
}

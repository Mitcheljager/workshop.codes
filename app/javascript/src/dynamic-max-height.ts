export function bind(): void {
  window.addEventListener("scroll", setHeight, { passive: true })
  window.addEventListener("resize", setHeight, { passive: true })
  setHeight()
}

export function destroy(): void {
  window.removeEventListener("scroll", setHeight)
  window.removeEventListener("resize", setHeight)
}

function setHeight(): void {
  const elements = document.querySelectorAll("[data-role~='dynamic-max-height']")

  elements.forEach(element => {
    const parent = element.parentElement as HTMLElement
    const target = element.querySelector("[data-dynamic-height-target]") as HTMLElement
    const distanceFromTop = parent.getBoundingClientRect().top
    const distanceFromBottom = parent.getBoundingClientRect().bottom
    const maxHeight = window.innerHeight - distanceFromTop
    const parentDistanceFromBottom = Math.max((distanceFromBottom - window.innerHeight) * -1, 0)
    const visibleParentHeight = window.innerHeight - parentDistanceFromBottom

    target.style.maxHeight = `${Math.min(Math.min(maxHeight, visibleParentHeight), parent.offsetHeight)}px`
  })
}

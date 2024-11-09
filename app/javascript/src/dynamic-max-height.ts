export function bind() {
  window.addEventListener("scroll", setHeight, { passive: true })
  window.addEventListener("resize", setHeight, { passive: true })
  setHeight()
}

export function destroy() {
  window.removeEventListener("scroll", setHeight)
  window.removeEventListener("resize", setHeight)
}

function setHeight() {
  const elements = document.querySelectorAll("[data-role~='dynamic-max-height']")

  elements.forEach(element => {
    const parent = element.parentElement
    const target = element.querySelector("[data-dynamic-height-target]") as HTMLElement

    if (!parent || !target) return

    const distanceFromTop = parent.getBoundingClientRect().top
    const distanceFromBottom = parent.getBoundingClientRect().bottom
    const maxHeight = window.innerHeight - distanceFromTop
    const parentDistanceFromBottom = Math.max((distanceFromBottom - window.innerHeight) * -1, 0)
    const visibleParentHeight = window.innerHeight - parentDistanceFromBottom

    target.style.maxHeight = `${Math.min(Math.min(maxHeight, visibleParentHeight), parent.offsetHeight)}px`
  })
}
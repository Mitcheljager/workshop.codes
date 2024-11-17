export function bind(): void {
  window.addEventListener("scroll", stickyScroll, { passive: true })
  stickyScroll()
}

export function destroy(): void {
  window.removeEventListener("scroll", stickyScroll)
}

function stickyScroll(): void {
  const elements = Array.from(document.querySelectorAll("[data-role~='sticky']")) as HTMLElement[]

  elements.forEach(element => {
    if ((element.dataset.stickyDesktopOnly == "true" && window.innerWidth < 640) ||
        (element.dataset.stickyMobileOnly == "true" && window.innerWidth >= 640)) {
      setNotSticky(element)
      return
    }

    const scrollElement = element.dataset.sticky == "true" ? (document.querySelector("[data-role='sticky-placeholder']") as HTMLElement) : element
    const topOffset = scrollElement.getBoundingClientRect().top
    const scrollPosition = window.scrollY
    const documentOffset = topOffset + scrollPosition
    const stickyOffset = parseInt(element.dataset.stickyOffset || "0")

    if (documentOffset - scrollPosition - stickyOffset <= 0) setSticky(element, stickyOffset)
    else setNotSticky(element)
  })
}

function setSticky(element: HTMLElement, offset: number): void {
  if (element.dataset.sticky == "true") return
  element.dataset.sticky = "true"

  const absolute = element.dataset.stickyAbsolute

  const placeholderElement = document.createElement("div")
  if (absolute === undefined) placeholderElement.style.height = `${element.offsetHeight}px`
  placeholderElement.style.width = `${element.offsetWidth}px`
  placeholderElement.dataset.role = "sticky-placeholder"
  element.insertAdjacentElement("beforebegin", placeholderElement)

  element.style.width = `${element.offsetWidth}px`
  element.style.position = "fixed"
  element.style.top = offset + "px"
  element.classList.add("is-sticky")
}

function setNotSticky(element: HTMLElement): void {
  if (element.dataset.sticky != "true") return
  element.dataset.sticky = "false"

  const placeholderElement = document.querySelector("[data-role='sticky-placeholder']")
  if (placeholderElement) placeholderElement.remove()

  element.style.removeProperty("width")
  element.style.removeProperty("position")
  element.style.removeProperty("top")
  element.classList.remove("is-sticky")
}

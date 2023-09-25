export function bind() {
  window.addEventListener("scroll", stickyScroll, { passive: true })
  stickyScroll()
}

export function destroy() {
  window.removeEventListener("scroll", stickyScroll, { passive: true })
}

function stickyScroll() {
  const elements = document.querySelectorAll("[data-role~='sticky']")

  elements.forEach(element => {
    if ((element.dataset.stickyDesktopOnly == "true" && window.innerWidth < 640) ||
        (element.dataset.stickyMobileOnly == "true" && window.innerWidth >= 640)) {
      setNotSticky(element)
      return
    }

    const scrollElement = element.dataset.sticky == "true" ? document.querySelector("[data-role='sticky-placeholder']") : element
    const topOffset = scrollElement.getBoundingClientRect().top
    const scrollPosition = window.scrollY
    const documentOffset = topOffset + scrollPosition
    const stickyOffset = parseInt(element.dataset.stickyOffset || 0)

    if (documentOffset - scrollPosition - stickyOffset <= 0) setSticky(element, stickyOffset)
    else setNotSticky(element)
  })
}

function setSticky(element, offset) {
  if (element.dataset.sticky == "true") return
  element.dataset.sticky = "true"

  const absolute = element.dataset.stickyAbsolute

  const placeholderElement = document.createElement("div")
  if (absolute === undefined) placeholderElement.style.height = `${ element.offsetHeight }px`
  placeholderElement.style.width = `${ element.offsetWidth }px`
  placeholderElement.dataset.role = "sticky-placeholder"
  element.insertAdjacentElement("beforebegin", placeholderElement)

  element.style.width = `${ element.offsetWidth }px`
  element.style.position = "fixed"
  element.style.top = offset + "px"
  element.classList.add("is-sticky")
}

function setNotSticky(element) {
  if (element.dataset.sticky != "true") return
  element.dataset.sticky = "false"

  const placeholderElement = document.querySelector("[data-role='sticky-placeholder']")
  placeholderElement.remove()

  element.style.removeProperty("width")
  element.style.removeProperty("position")
  element.style.removeProperty("top")
  element.classList.remove("is-sticky")
}

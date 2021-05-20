document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role~='sticky']")

  window.removeEventListener("scroll", stickyScroll)
  if (element) window.addEventListener("scroll", stickyScroll)
})

function stickyScroll() {
  const element = document.querySelector("[data-role~='sticky']")
  const scrollElement = element.dataset.sticky == "true" ? document.querySelector("[data-role='sticky-placeholder']") : element
  const topOffset = scrollElement.getBoundingClientRect().top
  const scrollPosition = window.scrollY
  const documentOffset = topOffset + scrollPosition

  if (documentOffset - scrollPosition <= 0) setSticky(element)
  if (documentOffset - scrollPosition > 0) setNotSticky(element)
}

function setSticky(element) {
  if (element.dataset.sticky == "true") return
  element.dataset.sticky = "true"

  const placeholderElement = document.createElement("div")
  placeholderElement.style.height = `${ element.offsetHeight }px`
  placeholderElement.dataset.role = "sticky-placeholder"
  element.insertAdjacentElement("beforebegin", placeholderElement)

  element.style.width = `${ element.offsetWidth }px`
  element.style.position = "fixed"
  element.style.top = 0
  element.style.zIndex = 100
}

function setNotSticky(element) {
  if (element.dataset.sticky != "true") return
  element.dataset.sticky = "false"

  const placeholderElement = document.querySelector("[data-role='sticky-placeholder']")
  placeholderElement.remove()

  element.style = ""
}

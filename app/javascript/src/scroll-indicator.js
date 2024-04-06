import debounce from "@src/debounce"

export function bind() {
  const element = document.querySelector("[data-role~='scroll-indicator']")

  if (!element) return

  element.removeAndAddEventListener("scroll", () => scrollIndicator(element))
  scrollIndicator(element)
}

const scrollIndicator = debounce(element => {
  const scrollableDistanceFromRight = element.scrollWidth - element.clientWidth - element.scrollLeft
  const indicatorRight = document.querySelector("[data-role='scroll-indicator-right']")
  indicatorRight.classList.toggle("scroll-indicator--active", scrollableDistanceFromRight > 50)

  const scrolledFromLeft = element.scrollLeft
  const indicatorLeft = document.querySelector("[data-role='scroll-indicator-left']")
  indicatorLeft.classList.toggle("scroll-indicator--active", scrolledFromLeft > 50)
}, 10)

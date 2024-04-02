import { carousel, setCarousel } from "./carousel"

export function bind() {
  const elements = document.querySelectorAll("[data-action~='set-tab']")

  elements.forEach((element) => element.removeAndAddEventListener("click", setTab))
}

function setTab(event) {
  event.preventDefault()

  if (this.classList.contains("tabs__item--active")) return

  const target = this.dataset.target
  const parentElement = this.closest("[data-role~='tabs']")

  const tabElement = this.classList.contains("tabs__item") ? this : document.querySelector(`.tabs__item[data-target~='${target}']`)

  setActiveTab(tabElement, parentElement)
  revealTab(target, parentElement, scroll)
  if (this.dataset.action.includes("scroll")) scrollToElement(parentElement)
}

function revealTab(target, parentElement, scroll) {
  const targetElement = document.querySelector(`[data-tab~='${target}']`)
  const tabElements = parentElement.querySelectorAll(".tabs-content")

  const activeElement = Array.from(tabElements).find(element => {
    if (!element.classList.contains("tabs-content--active")) return
    if (element.closest("[data-role~='tabs']").innerHTML != parentElement.innerHTML) return

    return element
  })

  if (activeElement) activeElement.classList.add("tabs-content--transitioning-out")

  setTimeout(() => {
    if (activeElement) {
      activeElement.classList.remove("tabs-content--active")
      activeElement.classList.remove("tabs-content--transitioning-out")
    }

    targetElement.classList.add("tabs-content--active")
    targetElement.classList.add("tabs-content--transitioning-in")

    resetCarouselInTab(targetElement)
  }, 150)
}

function setActiveTab(targetElement, parentElement) {
  const tabs = parentElement.querySelectorAll(".tabs__item")

  tabs.forEach(tab => {
    if (tab.closest("[data-role~='tabs']").innerHTML != parentElement.innerHTML) return
    tab.classList.remove("tabs__item--active")
  })

  targetElement.classList.add("tabs__item--active")

  if (parentElement.dataset.tabsSetUrl) {
    window.history.replaceState(history.state, "", targetElement.href)
  }
}

function resetCarouselInTab(targetElement) {
  const carouselElement = targetElement.querySelector("[data-role='carousel']")
  if (!carouselElement || !carousel) return

  carousel.destroy(true)
  setCarousel(carouselElement)
}

function scrollToElement(element) {
  const scrollTop = document.documentElement.scrollTop
  const offset = element.getBoundingClientRect().top + scrollTop
  if (offset < scrollTop) window.scrollTo({ top: offset - 10 })
}

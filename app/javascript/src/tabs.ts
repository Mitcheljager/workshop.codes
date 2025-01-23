import { carousel, setCarousel } from "@src/carousel"

export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='set-tab']")

  elements.forEach((element) => element.removeAndAddEventListener("click", setTab))
}

function setTab(event: Event): void {
  event.preventDefault()

  const { currentTarget } = event
  if (!(currentTarget instanceof HTMLElement)) return

  if (currentTarget.classList.contains("tabs__item--active")) return

  const target = currentTarget.dataset.target
  const parentElement = currentTarget.closest("[data-role~='tabs']") as HTMLElement

  if (!target) return
  if (!parentElement) return

  const tabElement = (currentTarget.classList.contains("tabs__item") ? currentTarget : document.querySelector(`.tabs__item[data-target~='${target}']`)) as HTMLAnchorElement
  if (!tabElement) return

  setActiveTab(tabElement, parentElement)
  revealTab(target, parentElement)
  if (currentTarget.dataset.action?.includes("scroll")) scrollToElement(parentElement)
}

function revealTab(target: string, parentElement: Element): void {
  const targetElement = document.querySelector(`[data-tab~='${target}']`)
  const tabElements = parentElement.querySelectorAll(".tabs-content")

  const activeElement = Array.from(tabElements).find(element => {
    if (!element.classList.contains("tabs-content--active")) return
    if (element.closest("[data-role~='tabs']")?.innerHTML != parentElement.innerHTML) return

    return element
  })

  if (activeElement) activeElement.classList.add("tabs-content--transitioning-out")

  setTimeout(() => {
    if (activeElement) {
      activeElement.classList.remove("tabs-content--active")
      activeElement.classList.remove("tabs-content--transitioning-out")
    }

    if (!targetElement) return

    targetElement.classList.add("tabs-content--active")
    targetElement.classList.add("tabs-content--transitioning-in")

    resetCarouselInTab(targetElement)
  }, 150)
}

function setActiveTab(targetElement: HTMLAnchorElement, parentElement: HTMLElement): void {
  const tabs = parentElement.querySelectorAll(".tabs__item")

  tabs.forEach((tab: Element) => {
    if (tab.closest("[data-role~='tabs']")?.innerHTML != parentElement.innerHTML) return
    tab.classList.remove("tabs__item--active")
  })

  targetElement.classList.add("tabs__item--active")

  if (parentElement.dataset.tabsSetUrl) {
    window.history.replaceState(history.state, "", targetElement.href)
  }
}

function resetCarouselInTab(targetElement: Element): void {
  const carouselElement = targetElement.querySelector("[data-role='carousel']") as HTMLElement
  if (!carouselElement || !carousel) return

  carousel.destroy(true)
  setCarousel(carouselElement)
}

function scrollToElement(element: Element): void {
  const scrollTop = document.documentElement.scrollTop
  const offset = element.getBoundingClientRect().top + scrollTop
  if (offset < scrollTop) window.scrollTo({ top: offset - 10 })
}

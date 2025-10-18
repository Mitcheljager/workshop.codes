import FetchRails from "@src/fetch-rails"
import * as lazyVideo from "@src/lazy-video"

export function bind(): void {
  const elements = Array.from(document.querySelectorAll("[data-action~='get-partial']")) as HTMLElement[]

  elements.forEach(element => {
    if (element.dataset.getOnLoad == "true") getPartial(null, element)
    if (element.dataset.lazy == "true") setObserver(element)
    else element.removeAndAddEventListener("click", getPartial)
  })
}

function setObserver(element: HTMLElement): void {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      getPartial(null, element)
      observer.unobserve(element)
    })
  })

  observer.observe(element)
}

function getPartial(event: Event | null, element: HTMLElement): void {
  if (event) event.preventDefault()

  const target = event?.target as HTMLElement

  let eventElement = element || target
  if (!eventElement.dataset.url) eventElement = target.closest<HTMLElement>("[data-action~='get-partial']")!

  const targetElement = document.querySelector<HTMLElement>(`[data-partial="${eventElement.dataset.target}"]`)
  const url = eventElement.dataset.url

  if (!targetElement || !url) return
  if (targetElement.dataset.loaded == "true") return

  targetElement.ariaBusy = "true"

  new FetchRails(url).get()
    .then(data => {
      targetElement.innerHTML = data as string
    })
    .then(() => {
      lazyVideo.bind(targetElement)

      if (eventElement.dataset.scrollOnLoad != "true") return

      const hash = window.location.hash?.substring(1)
      if (!hash) return

      const scrollElement = document.getElementById(hash)
      if (!scrollElement) return

      const scrollOffset = scrollElement.getBoundingClientRect().top + document.documentElement.scrollTop
      const stickyElement = document.querySelector("[data-role~='sticky']") as HTMLElement
      const scrollExtra = stickyElement ? stickyElement.offsetHeight * 1.25 : 0

      window.scrollTo({ top: scrollOffset - scrollExtra, behavior: "smooth" })
    })
    .catch(error => {
      console.error(error)
      targetElement.innerHTML = `<em>Something went wrong when loading, please try again. (${error})</em>`
    })
    .finally(() => {
      targetElement.dataset.loaded = "true"
      targetElement.ariaBusy = "false"
    })
}

import FetchRails from "./fetch-rails"

export function bind() {
  const elements = document.querySelectorAll("[data-action~='get-partial']")

  elements.forEach(element => {
    if (element.dataset.getOnLoad == "true") getPartial(event, element)
    if (element.dataset.lazy == "true") setObserver(element)
    else element.removeAndAddEventListener("click", getPartial)
  })
}

function setObserver(element) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      getPartial(null, element)
      observer.unobserve(element)
    })
  })

  observer.observe(element)
}

function getPartial(event, element) {
  if (event) event.preventDefault()

  const _this = element || event.target
  const targetElement = document.querySelector(`[data-partial="${ _this.dataset.target }"]`)
  const url = _this.dataset.url

  if (targetElement.dataset.loaded == "true") return

  new FetchRails(url).get()
    .then(data => {
      targetElement.innerHTML = data
    })
    .then(() => {
      if (_this.dataset.scrollOnLoad != "true") return

      const hash = window.location.hash?.substring(1)
      if (!hash) return

      const scrollElement = document.getElementById(hash)
      if (!scrollElement) return

      const scrollOffset = scrollElement.getBoundingClientRect().top + document.documentElement.scrollTop
      const stickyElement = document.querySelector("[data-role~='sticky']")
      const scrollExtra = stickyElement ? stickyElement.offsetHeight * 1.25 : 0

      window.scrollTo({ top: scrollOffset - scrollExtra, behavior: "smooth" })
    })
    .catch(error => {
      console.error(error)
      targetElement.innerHTML = `<em>Something went wrong when loading, please try again. (${ error })</em>`
    })
    .finally(() => {
      targetElement.dataset.loaded = "true"
    })
}

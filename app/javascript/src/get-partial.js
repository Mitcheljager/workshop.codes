import FetchRails from "./fetch-rails"

export function bind() {
  const elements = document.querySelectorAll("[data-action~='get-partial']")

  elements.forEach(element => {
    if (element.dataset.getOnLoad == "true") getPartial(event, element)
    if (element.dataset.lazy == "true") {
      document.removeAndAddEventListener("scroll", () => lazyLoadGetPartial(element), { passive: true })
      lazyLoadGetPartial(element)
    }
    else element.removeAndAddEventListener("click", getPartial)
  })
}

function lazyLoadGetPartial(element) {
  if (element.dataset.initialised == "true") return

  const threshold = 100

  if (element.getBoundingClientRect().top - window.outerHeight > threshold) return

  element.dataset.initialised = "true"
  getPartial(event, element)
}

function getPartial(event, element) {
  event.preventDefault()

  const _this = element || event.target
  const targetElement = document.querySelector(`[data-partial="${ _this.dataset.target }"]`)
  const url = _this.dataset.url

  if (targetElement.dataset.loaded == "true") return

  new FetchRails(url).get()
    .then(data => {
      targetElement.dataset.loaded = "true"
      targetElement.innerHTML = data
    })
}

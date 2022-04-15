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
      targetElement.dataset.loaded = "true"
      targetElement.innerHTML = data
    })
}

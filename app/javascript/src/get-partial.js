import FetchRails from "./fetch-rails"

export function bind() {
  const elements = document.querySelectorAll("[data-action~='get-partial']")

  elements.forEach(element => {
    element.removeAndAddEventListener("click", getPartial)

    if (element.dataset.getOnLoad == "true") getPartial(event, element)
  })
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

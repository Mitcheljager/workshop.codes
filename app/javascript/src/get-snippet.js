import FetchRails from "./fetch-rails"
import { initiateIde } from "./ide"

export function bind() {
  const elements = document.querySelectorAll("[data-action~='load-snippet']")

  elements.forEach((element) => {
    element.removeAndAddEventListener("click", loadSnippet)

    if (element.dataset.getOnLoad == "true") loadSnippet(event, element)
  })
}

function loadSnippet(event, element) {
  event.preventDefault()

  const _this = element || event.target

  if (_this.dataset.retrieved == "true") return

  _this.dataset.retrieved = true

  const id = _this.dataset.id

  const ideElement = document.querySelector("[data-role~='ide-content']")
  const copyElement = document.querySelector("[data-copy~='snippet']")

  new FetchRails("/get-snippet", { id: id })
    .post()
    .then(data => {
      ideElement.innerHTML = data.replaceAll(">", "&gt;").replaceAll("<", "&lt;")
      copyElement.innerHTML = data.replaceAll(">", "&gt;").replaceAll("<", "&lt;")

      initiateIde(ideElement)
    })
    .catch(error => {
      console.error(error)
      ideElement.innerHTML = `Failed to load Snippet <br>${ error }`
    })
}

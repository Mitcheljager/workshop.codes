import FetchRails from "@src/fetch-rails"
import { initiateIde } from "@src/ide"

export function bind() {
  const elements = Array.from(document.querySelectorAll("[data-action~='load-snippet']")) as HTMLElement[]

  elements.forEach((element) => {
    element.removeAndAddEventListener("click", loadSnippet)

    if (element.dataset.getOnLoad == "true") loadSnippet(null, element)
  })
}

function loadSnippet(event: Event | null, element: HTMLElement) {
  if (event) event.preventDefault()

  const targetElement = element || event?.target

  if (targetElement.dataset.retrieved == "true") return

  targetElement.dataset.retrieved = "true"

  const id = targetElement.dataset.id

  const ideElement = document.querySelector("[data-role~='ide-content']") as HTMLElement
  const copyElement = document.querySelector("[data-copy~='snippet']") as HTMLElement

  new FetchRails("/get-snippet", { id: id })
    .post()
    .then(data => {
      ideElement.innerHTML = data.replaceAll(">", "&gt;").replaceAll("<", "&lt;")
      copyElement.innerHTML = data.replaceAll(">", "&gt;").replaceAll("<", "&lt;")

      initiateIde(ideElement)
    })
    .catch(error => {
      console.error(error)
      ideElement.innerHTML = ""

      const errorElement = document.createElement("div")
      errorElement.innerText = error

      ideElement.innerText = "Failed to load Snippet"
      ideElement.insertAdjacentElement("beforeend", errorElement)
    })
}

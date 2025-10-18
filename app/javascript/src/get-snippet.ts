import FetchRails from "@src/fetch-rails"
import { initiateIde } from "@src/ide"

export function bind(): void {
  const elements = Array.from(document.querySelectorAll("[data-action~='load-snippet']")) as HTMLElement[]

  elements.forEach((element) => {
    element.removeAndAddEventListener("click", loadSnippet)

    if (element.dataset.getOnLoad == "true") loadSnippet(null, element)
  })
}

function loadSnippet(event: Event | null, element: HTMLElement): void {
  if (event) event.preventDefault()

  const targetElement = element || event?.target

  if (targetElement.dataset.retrieved == "true") return

  targetElement.dataset.retrieved = "true"

  const code = targetElement.dataset.code

  const ideElement = document.querySelector<HTMLElement>("[data-role~='ide-content']")!
  const copyElement = document.querySelector<HTMLElement>("[data-copy~='snippet']")!

  new FetchRails(`/get-snippet/${code}`)
    .get()
    .then(data => {
      ideElement.innerHTML = (data as string).replaceAll(">", "&gt;").replaceAll("<", "&lt;")
      copyElement.innerHTML = (data as string).replaceAll(">", "&gt;").replaceAll("<", "&lt;")

      initiateIde(ideElement)
    })
    .catch(error => {
      console.error(error)
      ideElement.innerHTML = ""

      const errorElement = document.createElement("div")

      ideElement.innerText = "Failed to load Snippet"
      ideElement.insertAdjacentElement("beforeend", errorElement)
    })
}

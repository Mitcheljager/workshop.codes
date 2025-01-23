export function bind(): void {
  const youtubePreviewButtons = document.querySelectorAll("[data-action~='youtube-preview']")
  youtubePreviewButtons.forEach(element => {
    element.removeAndAddEventListener("click", load)
    element.removeAndAddEventListener("keydown", keydown)
  })
}

function load(event: MouseEvent | KeyboardEvent): void {
  event.preventDefault()

  const currentTarget = event.currentTarget as HTMLAnchorElement

  if (currentTarget.dataset.loaded === "true") return

  const youtubeId = currentTarget.dataset.id
  const parent = currentTarget.closest(".video")
  const images = parent!.querySelectorAll("img")
  const iframe = createIframe(youtubeId!)

  images.forEach(image => image.remove())
  parent!.innerHTML = ""
  parent!.insertAdjacentElement("beforeend", iframe)
  currentTarget.dataset.loaded = "true"
}

function createIframe(youtubeId: string): HTMLIFrameElement {
  const element = document.createElement("iframe")

  element.width = "560"
  element.height = "315"
  element.allowFullscreen = true
  element.src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&playsinline=1&enablejsapi=1`
  element.frameBorder = "0"
  element.allow = "autoplay"
  element.classList.add("video__iframe")

  return element
}

function keydown(event: KeyboardEvent): void {
  if (event.key !== "Enter" && event.key !== " ") return

  load(event)
}

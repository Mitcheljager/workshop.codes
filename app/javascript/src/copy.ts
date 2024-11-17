import FetchRails from "@src/fetch-rails"

export function bind(): void {
  document.body.removeAndAddEventListener("click", copyToClipboard)
}

export default function copyToClipboard(event: MouseEvent, optionalContent = ""): void {
  let eventTarget = event.target as HTMLElement | undefined | null
  if (eventTarget?.dataset?.action != "copy") eventTarget = eventTarget?.closest("[data-action~='copy-to-clipboard']")

  if (!eventTarget) return

  event.preventDefault()

  const target: string = eventTarget.dataset.target || ""
  const targetElement = document.querySelector(`[data-copy="${target}"]`) as HTMLElement

  const { textContent } = targetElement

  if (!textContent) return

  copyValueToClipboard(optionalContent || textContent)

  const notificationElement = document.createElement("div")
  notificationElement.classList.add("copy__notification")
  notificationElement.innerHTML = "✓"

  let copyParent = eventTarget.closest("button")?.querySelector(".copy")
  if (!copyParent) copyParent = eventTarget
  copyParent.append(notificationElement)

  setTimeout((): void | undefined => copyParent.querySelector(".copy__notification")?.remove(), 1000)

  if (targetElement.dataset.trackCopy != undefined) trackCopy(textContent)
}

export function copyValueToClipboard(value: string): void {
  const input = document.createElement("textarea")
  input.value = value
  document.body.appendChild(input)

  input.select()
  document.execCommand("copy")
  document.body.removeChild(input)
}

function trackCopy(label: string): void {
  new FetchRails("/copy-code", { code: label }).post()
}

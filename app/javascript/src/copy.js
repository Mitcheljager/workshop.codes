import FetchRails from "./fetch-rails"

export function bind() {
  document.body.removeAndAddEventListener("click", copyToClipboard)
}

export default function copyToClipboard(event, optionalContent = undefined) {
  let eventTarget = event.target
  if (eventTarget.dataset.action != "copy") eventTarget = event.target.closest("[data-action~='copy-to-clipboard']")
  if (!eventTarget) return

  event.preventDefault()

  const target = eventTarget.dataset.target
  const targetElement = document.querySelector(`[data-copy="${ target }"]`)

  if (!targetElement) return

  copyValueToClipboard(optionalContent || targetElement.textContent)

  const notificationElement = document.createElement("div")
  notificationElement.classList.add("copy__notification")
  notificationElement.innerHTML = "✓"

  let copyParent = eventTarget.closest("button").querySelector(".copy")
  if (!copyParent) copyParent = eventTarget
  copyParent.append(notificationElement)

  setTimeout(() => { copyParent.querySelector(".copy__notification").remove() }, 1000)

  if (targetElement.dataset.trackCopy != undefined) trackCopy(targetElement.textContent)
}

export function copyValueToClipboard(value) {
  const input = document.createElement("textarea")
  input.value = value
  document.body.appendChild(input)

  input.select()
  document.execCommand("copy")
  document.body.removeChild(input)
}

function trackCopy(label) {
  new FetchRails("/copy-code", { code: label }).post()
}

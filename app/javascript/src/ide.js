import * as microlight from "@src/microlight"

export function bind() {
  const fullscreenElements = document.querySelectorAll("[data-action='toggle-ide-fullscreen']")

  fullscreenElements.forEach(element => element.removeAndAddEventListener("click", toggleIdeFullscreen))
}

export function initiateIde(element) {
  createLineCount(element)

  microlight.reset()
}

function createLineCount(element) {
  const pre = element.closest("pre")

  const lineCount = element.textContent.split("\n").length

  const lineCountElement = pre.querySelector(".ide__line-counter")
  lineCountElement.innerHTML = ""

  for (let i = 0; i < lineCount; i++) {
    const element = document.createElement("div")
    element.textContent = i + 1

    lineCountElement.append(element)
  }
}

function toggleIdeFullscreen(event) {
  const element = event.target.closest(".ide")

  element.classList.toggle("ide--fullscreen")
}

import * as microlight from "@src/microlight"

export function bind(): void {
  const fullscreenElements = document.querySelectorAll("[data-action='toggle-ide-fullscreen']")

  fullscreenElements.forEach(element => element.removeAndAddEventListener("click", toggleIdeFullscreen))
}

export function initiateIde(element: HTMLElement): void {
  createLineCount(element)

  microlight.reset()
}

function createLineCount(element: HTMLElement): void {
  const pre = element.closest("pre") as HTMLElement

  const lineCount = element.textContent?.split("\n").length || 0

  const lineCountElement = pre.querySelector(".ide__line-counter") as HTMLElement
  lineCountElement.innerHTML = ""

  for (let i = 0; i < lineCount; i++) {
    const element = document.createElement("div")
    element.textContent = (i + 1).toString()

    lineCountElement.append(element)
  }
}

function toggleIdeFullscreen({ target }: { target: HTMLElement }): void {
  const element = target.closest(".ide") as HTMLElement

  element.classList.toggle("ide--fullscreen")
}

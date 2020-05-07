document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role='ide-content']")
  const copyElements = document.querySelectorAll("[data-action='copy-ide-content']")
  const fullscreenElements = document.querySelectorAll("[data-action='toggle-ide-fullscreen']")

  copyElements.forEach(element => element.removeEventListener("click", copyFullContent))
  copyElements.forEach(element => element.addEventListener("click", copyFullContent))

  fullscreenElements.forEach(element => element.removeEventListener("click", toggleIdeFullscreen))
  fullscreenElements.forEach(element => element.addEventListener("click", toggleIdeFullscreen))

  if (element) initiateIde(element)
})

function initiateIde(element) {
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

function copyFullContent(event) {
  const content = document.querySelector("[data-role='ide-content']").textContent
  copyToClipboard(event, content)
}

function toggleIdeFullscreen(event) {
  const element = event.target.closest(".ide")

  element.classList.toggle("ide--fullscreen")
}

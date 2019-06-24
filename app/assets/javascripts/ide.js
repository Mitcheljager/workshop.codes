let content = []
let currentContent = 0
let rulesList = []
let currentLineCount = 0
let currentLinePosition = 0

document.addEventListener("turbolinks:load", function() {
  resetValues()

  const element = document.querySelector("[data-role='ide-content']")
  const copyElements = document.querySelectorAll("[data-action='copy-ide-content']")
  const inputs = document.querySelectorAll("[data-role='ide-input']")
  const fullscreenElements = document.querySelectorAll("[data-action='toggle-ide-fullscreen']")

  inputs.forEach(input => input.removeEventListener("input", setIdeViaInput))
  inputs.forEach(input => input.addEventListener("input", setIdeViaInput))

  copyElements.forEach(element => element.removeEventListener("click", copyFullContent))
  copyElements.forEach(element => element.addEventListener("click", copyFullContent))

  fullscreenElements.forEach(element => element.removeEventListener("click", toggleIdeFullscreen))
  fullscreenElements.forEach(element => element.addEventListener("click", toggleIdeFullscreen))

  if (element) initiateIde(element)
})

function initiateIde(element) {
  const valueElement = document.querySelector("[data-role='ide-input']")
  const value = valueElement ? valueElement.value : element.textContent

  setAllContent(element, value)
  createRules()
  createLineCount(element)

  microlight.reset()
}

function setIdeViaInput(event) {
  const element = document.querySelector("[data-role='ide-content']")
  const value = this.value

  setAllContent(element, value)
  createRules(element)
  createLineCount(element)

  microlight.reset()
}

function setAllContent(element, value) {
  if (content) {
    content = value
    content = content.split("rule(")
    content.shift()
    content.forEach((rule, index) => { content[index] = "rule(" + content[index]; index++; })
  }

  if (!content.length) content = [value]

  element.innerHTML = content[currentContent]
}

function createLineCount(element) {
  if (!content.length) return

  const pre = element.closest("pre")

  const lineCount = content[currentContent].split("\n").length

  if (lineCount == currentLineCount) return

  const lineCountElement = pre.querySelector(".ide__line-counter")
  lineCountElement.innerHTML = ""

  for (let i = 0; i < lineCount; i++) {
    const element = document.createElement("div")
    element.textContent = i + 1

    lineCountElement.append(element)
  }

  currentLineCount = lineCount
}

function setLineHighlight(element) {
  selection = window.getSelection()
  let range = selection.getRangeAt(0)

  const lineFinder = document.createElement("span")

  range.insertNode(lineFinder)

  const offsetTop = lineFinder.getBoundingClientRect().top
  const scrollTop = element.closest("pre").scrollTop
  const lineOffset = offsetTop + scrollTop

  if (lineOffset == currentLinePosition) return

  const activeLine = document.createElement("span")
  activeLine.classList.add("ide__active-line")
  activeLine.style.top = lineOffset + "px"

  const currentActiveLine = element.closest("pre").querySelector(".ide__active-line")
  if (currentActiveLine) currentActiveLine.remove()

  element.closest(".ide__code-wrapper").append(activeLine)

  currentLinePosition = lineOffset
}

function createRules() {
  if (!content.length) return

  const element = document.querySelector("[data-role='ide-rules']")

  let array = []
  let flattenedContent = content.join()

  let contentArray = flattenedContent.split("rule(")
  element.innerHTML = contentArray.length ? "" : "No Rules are declared."

  contentArray.forEach(item => {
    item = item.replace(/^/, "rule(")
    const matches = item.match(/rule\("(.*)"\)/g)

    if (!matches) return

    array.push(matches.map(rule => rule.replace('rule("', "").replace('")', "")))
  })

  contentArray.shift()

  let index = 0
  array.forEach((rule, index) => {
    const item = document.createElement("div")

    if (index == currentContent) item.classList.add("active")

    item.innerHTML = rule
    item.dataset.contentIndex = index
    item.addEventListener("click", changeCurrentContent)

    element.append(item)
    index++
  })

  rulesList = contentArray
}

function changeCurrentContent(event) {
  const element = document.querySelector("[data-role='ide-content']")
  const activeElement = element.closest(".ide").querySelector(".active")

  if (activeElement) activeElement.classList.remove("active")
  this.classList.add("active")

  currentContent = this.dataset.contentIndex
  element.innerHTML = content[currentContent]

  microlight.reset()
  createLineCount(element)
}

function getCursorPosition(element) {
  let sel = document.getSelection()
  sel.modify("extend", "backward", "documentboundary")
  let pos = sel.toString().length

  if (sel.anchorNode != undefined) sel.collapseToEnd()

  return pos
}

function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange()
    range.selectNode(node)
    range.setStart(node, 0)
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count)
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length
      } else {
        range.setEnd(node, chars.count)
        chars.count = 0
      }
    } else {
      for (let lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range)

        if (chars.count === 0) break
      }
    }
  }

  return range
}

function setCurrentCursorPosition(element, position) {
  if (position <= 0) return

  const selection = window.getSelection()
  const range = createRange(element, { count: position })

  if (range) {
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)
  }
}

function resetValues() {
  content = []
  currentContent = 0
  rulesList = []
  currentLineCount = 0
  currentLinePosition = 0
}

function copyFullContent(event) {
  const fullContent = content.join("")

  copyToClipboard(event, fullContent)
}

function toggleIdeFullscreen(event) {
  console.log("a")
  const element = event.target.closest(".ide")

  element.classList.toggle("ide--fullscreen")
}

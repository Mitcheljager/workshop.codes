let content = []
let currentContent = 0
let rulesList = []
let currentLineCount = 0
let currentLinePosition = 0

document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role='ide-content']")

  element.removeEventListener("input", () => { syntaxHighlight(element) })
  element.addEventListener("input", () => { syntaxHighlight(element) })

  element.removeEventListener("click", () => { setLineHighlight(element) })
  element.addEventListener("click", () => { setLineHighlight(element) })

  element.removeEventListener("keyup", () => { setLineHighlight(element); keyPress(element) })
  element.addEventListener("keyup", () => { setLineHighlight(element); keyPress(element) })

  initiateIde(element)
})

function initiateIde(element) {
  setAllContent(element)
  createRules()
}

function syntaxHighlight(element) {
  const currentCursorPosition = getCursorPosition()

  microlight.reset()

  setCurrentCursorPosition(element, currentCursorPosition)
}

function setAllContent(element) {
  content = element.textContent
  content = content.split("rule(")
  content.shift()
  content.forEach((rule, index) => { content[index] = "rule(" + content[index]; index++; })

  element.innerHTML = content[currentContent]
}

function createLineCount(element) {
  const pre = element.closest("pre")

  const lineCount = content[currentContent].split("\n").length

  if (lineCount == currentLineCount) return

  const lineCountElement = pre.querySelector(".ide__line-counter")
  lineCountElement.innerHTML = ""

  for (let i = 0; i < lineCount; i++) {
    const element = document.createElement("div")
    element.textContent = currentLineCount + i + 1

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

function keyPress(element) {
  if (event.which == 13 || event.keyCode == 13) {
    const currentCursorPosition = getCursorPosition()
    const range = selection.getRangeAt(0)
    const linebreak = document.createTextNode("\n")

    range.insertNode(linebreak)

    setCurrentCursorPosition(element, currentCursorPosition)
  }
}

function createRules() {
  const element = document.querySelector("[data-role='ide-rules']")
  element.innerHTML = ""

  let array = []

  content.forEach(item => {
    const matches = item.match(/rule\("(.*)"\)/g)

    if (!matches) return

    array.push(matches.map(rule => rule.replace('rule("', "").replace('")', "")))
  })

  if (array.length == rulesList.length) return

  let index = 0
  array.forEach((rule, index) => {
    const item = document.createElement("div")
    item.innerHTML = rule
    item.dataset.contentIndex = index
    item.addEventListener("click", changeCurrentContent)

    element.append(item)
    index++
  })

  rulesList = array
}

function changeCurrentContent(event) {
  const element = document.querySelector("[data-role='ide-content']")

  currentContent = this.dataset.contentIndex
  element.innerHTML = content[currentContent]

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

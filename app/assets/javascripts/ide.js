let content = []
let currentContent = 0
let rulesList = []
let currentLineCount = 0
let currentLinePosition = 0

document.addEventListener("turbolinks:load", function() {
  resetValues()

  const element = document.querySelector("[data-role='ide-content']")
  const inputs = document.querySelectorAll("[data-role='ide-input']")

  inputs.forEach(input => input.removeEventListener("input", setIdeViaInput))
  inputs.forEach(input => input.addEventListener("input", setIdeViaInput))

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

function syntaxHighlight(element) {
  const currentCursorPosition = getCursorPosition()

  microlight.reset()

  setCurrentCursorPosition(element, currentCursorPosition)

  content[currentContent] = element.innerText
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

function moveContent(array, from, to) {
  return array.splice(to, 0, this.splice(from, 1)[0])
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

function createGlobalVariables(element) {
  const matches = new Set(content[currentContent].match(/(Global Variable\()[A-Z]{1}/g))
  const cssClass = "syntax-highlight syntax-highlight--white"
  const contentPlaceholder = content[currentContent]

  matches.forEach(match => {
    element.textContent.replace(match, "Hey")
    console.log(match)
  })

  element.innerHTML = contentPlaceholder
}

function replaceAt(string, index, replace) {
  return string.substring(0, index) + replace + string.substring(index + 1);
}

function resetValues() {
  content = []
  currentContent = 0
  rulesList = []
  currentLineCount = 0
  currentLinePosition = 0
}

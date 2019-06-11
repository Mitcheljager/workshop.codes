let content = ""
let currentLineCount = 0
let currentLinePosition = 0

document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role='ide']")

  element.removeEventListener("input", () => { synxtaxHighlight(element) })
  element.addEventListener("input", () => { synxtaxHighlight(element) })

  element.removeEventListener("click", () => { setLineHighlight(element) })
  element.addEventListener("click", () => { setLineHighlight(element) })

  element.removeEventListener("keyup", () => { setLineHighlight(element); keyPress(element) })
  element.addEventListener("keyup", () => { setLineHighlight(element); keyPress(element) })

  synxtaxHighlight(element)
})

function synxtaxHighlight(element) {
  content = element.textContent

  const simples = {
    "Event Player": "cyan",
    "All Players": "cyan",
    "Each Player": "cyan",
    "All Teams": "cyan",
    "Players In Slot": "red",
    "event": "red",
    "Global": "red",
    "Variable": "red",
    "Position Of": "red",
    "Destroy": "red",
    "HUD Text": "red",
    "Effect": "red",
    "In-World Text": "red",
    "Has Spawned": "red",
    "Player Died": "red",
    "Visible To": "red",
    "Ongoing": "red",
    "rule": "red",
    "actions": "red",
    "conditions": "red",
    "Match Time": "red",
    "Built-In Game Mode Completion": "red",
    "Ignore Condition": "red",
    "Team": "red",
    "Slot": "red",
    "True": "orange",
    "False": "orange",
    "Null": "orange",
    "String": "orange",
    "Create": "purple",
    "Set": "purple",
    "Divide": "purple",
    "Multiply": "purple",
    "Add": "purple",
    "Subtract": "purple",
    "Disable": "purple",
    "Pause": "purple",
    "Teleport": "purple",
    "Wait": "purple",
    "Loop": "purple",
    "Vector": "blue",
    "Facing Direction Of": "blue",
    "Horizontal Angle From Direction": "blue",
    "Vertical Angle From Direction": "blue",
    "Resurrect": "blue",
    "Hero Of": "blue",
    "Hero": "blue",
    "Facing": "blue",
    "Respawn": "blue",
    "Respawn Max Time": "blue"
  }

  const currentCursorPosition = getCursorPosition()

  createStrings(element)

  for (let key in simples) {
    createSimple(element, key, simples[key])
  }

  element.innerHTML = content
  removeChilds(element)
  createLineCount(element)

  setCurrentCursorPosition(element, currentCursorPosition)
}

function createStrings(element) {
  let matches = content.match(/\".*?\"/g)
  matches = Array.from(new Set(matches))
  const cssClass = "syntax-highlight syntax-highlight--green"

  if (!matches) return

  matches.forEach(match => {
    content = content.replace(match, `<span class="${ cssClass }">${ match }</span>`)
  })
}

function createSimple(element, string, color) {
  const cssClass = `syntax-highlight syntax-highlight--${ color }`
  content = content.replace(new RegExp(string, "g"), `<span class="${ cssClass }">${ string }</span>`)
}

function createNumbers(element) {
  let matches = content.match(/\d+\.?\d*/g)

  matches = Array.from(new Set(matches))
  const cssClass = "syntax-highlight syntax-highlight--orange"

  if (!matches) return

  matches.forEach(match => {
    content = content.replace(new RegExp(match, "g"), `<span class="${ cssClass }">${ match }</span>`)
  })
}

function removeChilds(element) {
  const elements = element.querySelectorAll("span.syntax-highlight span.syntax-highlight")

  elements.forEach(element => element.className = "")
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

function createLineCount(element) {
  const pre = element.closest("pre")

  const newLineCount = element.innerHTML.split("\n").length

  for (var i = 0; i < newLineCount - currentLineCount; i++) {
    var line_num = pre.querySelector(".ide__line-counter")
    line_num.innerHTML += "<span>" + (currentLineCount + i + 1) + "</span>"
  }

  currentLineCount = newLineCount
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

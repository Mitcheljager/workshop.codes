let content = ""

document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role='ide']")

  element.removeEventListener("input", () => { synxtaxHighlight(element) })
  element.addEventListener("input", () => { synxtaxHighlight(element) })

  synxtaxHighlight(element)
})

function synxtaxHighlight(element) {
  content = element.textContent

  const simples = {
    "event": "red",
    "Global": "red",
    "Variable": "red",
    "Position Of": "red",
    "Destroy": "red",
    "HUD Text": "red",
    "Effect": "red",
    "In-World Text": "red",
    "Has Spawned": "red",
    "Visible To": "red",
    "Ongoing": "red",
    "rule": "red",
    "actions": "red",
    "conditions": "red",
    "Match Time": "red",
    "Built-In Game Mode Completion": "red",
    "Event Player": "cyan",
    "All Players": "cyan",
    "Each Player": "cyan",
    "All Teams": "cyan",
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
    "Pause": "purple"
  }

  const currentCursorPosition = cursorPosition()

  createStrings(element)
  createNumbers(element)

  for (let key in simples) {
    createSimple(element, key, simples[key])
  }

  element.innerHTML = content
  removeChilds(element)

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

function cursorPosition(element) {
  let sel = document.getSelection()
  sel.modify("extend", "backward", "documentboundary")
  let pos = sel.toString().length
  console.log("pos: " + pos)
  if (sel.anchorNode != undefined) sel.collapseToEnd()

  return pos
}

function createRange(node, chars, range) {
    if (!range) {
        range = document.createRange()
        range.selectNode(node);
        range.setStart(node, 0);
    }

    if (chars.count === 0) {
        range.setEnd(node, chars.count);
    } else if (node && chars.count >0) {
        if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < chars.count) {
                chars.count -= node.textContent.length;
            } else {
                 range.setEnd(node, chars.count);
                 chars.count = 0;
            }
        } else {
            for (var lp = 0; lp < node.childNodes.length; lp++) {
                range = createRange(node.childNodes[lp], chars, range);

                if (chars.count === 0) {
                   break;
                }
            }
        }
   }

   return range;
};

function setCurrentCursorPosition(element, chars) {
    if (chars >= 0) {
        var selection = window.getSelection();

        range = createRange(element, { count: chars });

        if (range) {
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        }
    }
};

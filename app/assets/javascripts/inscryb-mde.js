//= require inscrybmde/dist/inscrybmde.min.js
//= require inscrybe-mde-paste-image

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-role~='simple-mde']")

  elements.forEach((element) => {
    new InitialiseInscrybeMDE(element).initialise()
  })
})

class InitialiseInscrybeMDE {
  constructor(element) {
    this.element = element
    this.mde = null
    this.codemirror = null
    this.enableBlocks = element.dataset.enableBlocks
    this.toolbar = this.setToolbar()
  }

  setToolbar() {
    const toolbar = [
      "preview",
      "fullscreen",
      "|",
      "bold",
      "italic",
      {
        action: () => { this.insertHighlight() },
        name: "highlight",
        className: "fa fa-highlight",
        title: "Highlight"
      },
      "heading",
      "|",
      "unordered-list",
      "ordered-list",
      "|",
      "horizontal-rule",
      "quote",
      "code",
      "link",
      {
        action: () => { this.toggleImageUploader() },
        name: "image",
        className: "fa fa-image",
        title: "Upload an image"
      },
      "|",
      "table",
      {
        action: () => { this.insertGallery() },
        name: "gallery",
        className: "fa fa-gallery",
        title: "Gallery"
      },
      {
        action: () => { this.insertHeroIconSelect() },
        name: "hero-icon",
        className: "fa fa-hero-icon",
        title: "Hero Icon (Use English Hero name). Simple names are ok (Torbjörn -> Torbjorn)"
      }
    ]
    
    if (this.enableBlocks) {
      toolbar.push("|")

      toolbar.push({
        action: () => { this.insertBlock("gallery") },
        name: "Gallery Block",
        className: "fa fa-block-gallery",
        title: "Gallery"
      })
    }

    return toolbar
  }
  
  initialise() {
    this.mde = new InscrybMDE({
      element: this.element,
      autoDownloadFontAwesome: false,
      autofocus: false,
      forceSync: true,
      blockStyles: {
        italic: "_"
      },
      status: true,
	    status: ["lines", "words"],
      spellChecker: false,
      promptURLs: true,
      insertTexts: {
        table: ["", "\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n"]
      },
      previewRender: (plainText, preview) => {
        new FetchRails("/parse-markdown", { post: { description: plainText } })
        .post().then(data => {
          preview.innerHTML = data
        })
    
        return `<div class="p-1/2"><div class="spinner"></div></div>`
      },
      toolbar: this.toolbar
    })

    this.codemirror = this.mde.codemirror
    this.bindPaste()
    this.parseBlocks()
  }

  bindPaste() {
    this.codemirror.on("paste", (editor, event) => {
      new InscrybeInsertImage(event, editor).paste()
    })
  }

  insertHighlight() {
    const selectedText = this.codemirror.getSelection()
    const text = selectedText || "text"
    const output = "==" + text + "=="

    this.codemirror.replaceSelection(output)
  }

  insertGallery() {
    const output = '[gallery {\n  "Gallery Item 1": "https://",\n  "Gallery Item 2": "https://"\n}]'

    this.codemirror.replaceSelection(output)
  }

  insertHeroIconSelect() {
    const button = this.mde.gui.toolbar.querySelector(".fa-hero-icon").closest("button")
  
    button.classList.toggle("dropdown-open")
  
    if (button.classList.contains("dropdown-open")) {
      const dropdownElement = document.createElement("div")
      dropdownElement.classList.add("editor-dropdown")
  
      const heroes =  ["Ana", "Ashe", "Baptiste", "Bastion", "Brigitte", "D.Va", "Doomfist", "Echo", "Genji", "Hanzo", "Junkrat", "Lúcio", "McCree", "Mei", "Mercy", "Moira", "Orisa", "Pharah", "Reaper", "Reinhardt", "Roadhog", "Sigma", "Soldier: 76", "Sombra", "Symmetra", "Torbjörn", "Tracer", "Widowmaker", "Winston", "Wrecking Ball", "Zarya", "Zenyatta"]
      heroes.forEach(hero => {
        const heroElement = document.createElement("div")
        heroElement.classList.add("editor-dropdown__item")
        heroElement.innerText = hero
  
        heroElement.addEventListener("click", () => {
          this.codemirror.replaceSelection(`[hero ${ hero }]`)
        })
  
        dropdownElement.append(heroElement)
      })
  
      button.append(dropdownElement)
    } else {
      button.querySelector(".editor-dropdown").remove()
    }
  }

  insertBlock(name = "", existingBlock = true, blockId = null, lineNumber = null, charCount = 0) {
    let position = this.codemirror.getCursor()

    if (existingBlock) {
      this.codemirror.replaceRange("\n\n\n", position)
      position = this.codemirror.getCursor()
    }

    const markerElement = document.createElement("div")
    markerElement.innerHTML = `<div class="well well--dark">Loading block...</div>`

    const marker = this.codemirror.markText({ line: lineNumber || position.line - 1, ch: 0 }, { line: lineNumber || position.line, ch: charCount }, {
      replacedWith: markerElement,
      addToHistory: existingBlock,
      inclusiveLeft: false,
      inclusiveRight: false
    })

    new FetchRails(`/blocks/show_or_create`, { name: name, id: blockId })
    .post().then(data => { 
      marker.widgetNode.innerHTML = data
      
      const blockId = marker.widgetNode.querySelector("[data-id]").dataset.id
      marker.lines[0].text = `[block ${ blockId }]`

      const dropzone = marker.widgetNode.querySelector("[data-role='dropzone']")
      const cssVariableElement = marker.widgetNode.querySelector("[data-action~='set-css-variable']")

      if (dropzone) new Dropzone(dropzone).bind()
      if (cssVariableElement) cssVariableElement.addEventListener("input", setCssVariable)
    })
    .catch(error => alert(error))
    .finally(() => marker.changed())
  }

  parseBlocks() {
    const linesFound = []
    let lineNumber = 0

    this.codemirror.eachLine(line => {
      const match = /\[block\s+(.*?)\]/.exec(line.text)

      if (match) {
        if (linesFound.includes(line.text)) return
        linesFound.push(match[1])

        this.insertBlock(this.mde, false, match[1], lineNumber, match[0].length)
      }

      lineNumber++
    })
  }
  
  toggleImageUploader() {
    const button = this.mde.gui.toolbar.querySelector(".fa-image").closest("button")
  
    button.classList.toggle("dropdown-open")
  
    if (button.classList.contains("dropdown-open")) {
      const dropdownElement = document.createElement("div")
      dropdownElement.classList.add("editor-dropdown")

      const textElement = document.createElement("small")
      textElement.innerText = "Upload an image. Alternative, with an image on your clipboard simply paste it in the text area."

      const randomId = Math.random().toString().substr(2, 8)
      const labelElement = document.createElement("label")
      const labelClasslist = ["button", "button--small", "mt-1/4", "w-100"]
      labelElement.for = randomId
      labelElement.innerText = "Upload image"
      labelElement.classList.add(...labelClasslist)
      
      const inputElement = document.createElement("input")
      inputElement.type = "file"
      inputElement.id = randomId
      inputElement.classList.add("hidden-field")
      
      inputElement.addEventListener("change", () => { new InscrybeInsertImage(event, this.codemirror).input() })
      labelElement.addEventListener("click", () => { inputElement.click() })

      document.body.append(inputElement)

      textElement.append(labelElement)
      dropdownElement.append(textElement)
      button.append(dropdownElement)
    } else {
      button.querySelector(".editor-dropdown").remove()
    }
  }
}

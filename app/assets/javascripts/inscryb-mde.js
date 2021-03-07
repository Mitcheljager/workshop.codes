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
    this.mde = ""
    this.markers = []
  }

  initialise() {
    const _this = this

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
      insertTexts: {
        table: ["", "\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n"]
      },
      toolbar: [
        "bold",
        "italic",
        {
          action: _this.insertHighlight,
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
          action: _this.toggleImageUploader,
          name: "image",
          className: "fa fa-image",
          title: "Upload an image"
        },
        "|",
        "table",
        {
          action: _this.insertGallery,
          name: "gallery",
          className: "fa fa-gallery",
          title: "Gallery"
        },
        {
          action: _this.insertHeroIconSelect,
          name: "hero-icon",
          className: "fa fa-hero-icon",
          title: "Hero Icon (Use English Hero name). Simple names are ok (Torbjörn -> Torbjorn)"
        },
        "|",
        "fullscreen",
        "|",
        {
          action: function customAction(editor) { _this.insertBlock(editor, _this, ) },
          name: "Gallery",
          className: "fa fa-gallery",
          title: "Gallery"
        },
      ]
    })

    this.bindPaste()
  }

  bindPaste() {
    this.mde.codemirror.on("paste", (editor, event) => {
      new InscrybeInsertImage(event, editor).paste()
    })
  }

  insertHighlight(editor) {
    let output = ""
    const cm = editor.codemirror
    const selectedText = cm.getSelection()
    const text = selectedText || "text"

    output = "==" + text + "=="
    cm.replaceSelection(output)
  }

  insertGallery(editor) {
    const cm = editor.codemirror
    const output = '[gallery {\n  "Gallery Item 1": "https://",\n  "Gallery Item 2": "https://"\n}]'

    cm.replaceSelection(output)
  }

  insertHeroIconSelect(editor) {
    const cm = editor.codemirror
    const button = editor.gui.toolbar.querySelector(".fa-hero-icon").closest("button")
  
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
          cm.replaceSelection(`[hero ${ hero }]`)
        })
  
        dropdownElement.append(heroElement)
      })
  
      button.append(dropdownElement)
    } else {
      button.querySelector(".editor-dropdown").remove()
    }
  }

  insertBlock(editor, _this) {
    const position = editor.codemirror.getCursor()
    editor.codemirror.replaceRange("\n\n", position)

    const markerElement = document.createElement("div")
    markerElement.innerHTML = `<div class="well well--dark">Loading block...</div>`

    const marker = editor.codemirror.markText({line: position.line + 1, ch: 0 }, { line: position.line + 2, ch: 0 }, {
      replacedWith: markerElement,
      addToHistory: true,
      inclusiveLeft: false,
      inclusiveRight: false
    })

    this.markers.push(marker)

    const markerId = this.markers.length - 1

    console.log(this.markers)

    new FetchRails(`/blocks/show_or_create`, { name: "gallery" })
    .post().then(data => { 
      this.markers[markerId].widgetNode.innerHTML = data
      
      const blockId = this.markers[markerId].widgetNode.querySelector("[data-id]").dataset.id
      this.markers[markerId].lines[0].text = `[block ${ blockId }]`

      this.markers[markerId].changed()
    })
    .catch(error => alert(error))


    console.log(this.markers)
  }
  
  toggleImageUploader(editor) {
    const button = editor.gui.toolbar.querySelector(".fa-image").closest("button")
  
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
      
      inputElement.addEventListener("change", () => { new InscrybeInsertImage(event, editor.codemirror).input() })
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

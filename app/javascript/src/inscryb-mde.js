import InscrybeInsertImage from "@src/inscrybe-mde-paste-image"
import InscrybeInsertVideo from "@src/inscrybe-mde-insert-video"
import FetchRails from "@src/fetch-rails"
import { insertAbilityIconSelect } from "@src/inscryb-mde-ability-select"
import { buildInputSortable, insertBlockTemplate, removeBlockTemplate } from "@src/blocks"
import debounce from "@src/debounce"
import * as lazyVideo from "@src/lazy-video"

let editors = []

export function render() {
  const elements = document.querySelectorAll("[data-role~='simple-mde']")

  elements.forEach((element) => {
    new InitialiseInscrybeMDE(element).initialise()

  })
}

export function destroy() {
  editors.forEach(editor => {
    editor.toTextArea()
  })

  editors = []
}

class InitialiseInscrybeMDE {
  constructor(element) {
    this.element = element
    this.mde = null
    this.codemirror = null
    this.enableBlocks = element.dataset.enableBlocks
    this.enableWiki = element.dataset.enableWiki
    this.maxLength = element.dataset.maxLength || 1000000
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
        action: () => this.insertHighlight(),
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
        action: () => this.toggleImageUploader(),
        name: "image",
        className: "fa fa-image",
        title: "Upload an image"
      },
      {
        action: () => this.toggleVideoUploader(),
        name: "video",
        className: "fa fa-video",
        title: "Upload a video"
      },
      "|",
      "table",
      {
        action: () => this.insertGallery(),
        name: "gallery",
        className: "fa fa-gallery",
        title: "Gallery"
      },
      {
        action: () => this.insertUpdateNotes(),
        name: "update-notes",
        className: "fa fa-update-notes",
        title: "Update Notes"
      },
      {
        action: () => this.insertHeroIconSelect(),
        name: "hero-icon",
        className: "fa fa-hero-icon",
        title: "Hero Icon (Use English Hero name). Simple names are ok (Torbjörn -> Torbjorn)"
      },
      {
        action: () => insertAbilityIconSelect(this.element, this.mde, this.codemirror),
        name: "ability-icon",
        className: "fa fa-ability-icon",
        title: "Ability Icon (Use English ability name)."
      }
    ]

    if (this.enableBlocks) {
      toolbar.push({
        action: () => { this.insertBlock("faq") },
        name: "FAQ Block",
        className: "fa fa-block-faq",
        title: "FAQ Block"
      })
    }

    if (this.enableWiki) {
      toolbar.push("|")

      toolbar.push({
        action: () => this.toggleWikiSearch(),
        name: "wiki",
        className: "fa fa-wiki",
        title: "Wiki Link"
      })
    }

    return toolbar
  }

  async initialise() {
    const { default: InscrybMDE } = await import("inscrybmde")

    this.mde = new InscrybMDE({
      element: this.element,
      autoDownloadFontAwesome: false,
      autofocus: false,
      forceSync: true,
      blockStyles: {
        italic: "_"
      },
	    status: ["lines", "words", {
        className: "characters",
        onUpdate: statusElement => {
          this.characters = this.codemirror.getValue().length
          statusElement.innerHTML = this.characters

          statusElement.classList.toggle("error", this.characters > this.maxLength)
          if (this.characters > this.maxLength) statusElement.innerHTML += ` / ${this.maxLength}`
        }
      }],
      spellChecker: false,
      promptURLs: true,
      insertTexts: {
        image: ["![Text description](http://", ")"],
        table: ["", "\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n"]
      },
      previewRender: (plainText, preview) => {
        new FetchRails("/parse-markdown", { post: { description: plainText } })
          .post().then(data => {
            preview.innerHTML = data
            lazyVideo.bind()
          })

        return "<div class=`p-1/2`><div class=`spinner`></div></div>"
      },
      toolbar: this.toolbar
    })

    this.codemirror = this.mde.codemirror
    this.bindPaste()
    this.parseBlocks()
    this.addAriaLabels()
    this.addSepartorRoles()

    editors.push(this.mde)

    document.removeAndAddEventListener("click", event => {
      if (event.target?.href?.includes("#")) event.preventDefault()
      this.possiblyCloseDropdown(event.target)
    })
  }

  bindPaste() {
    this.codemirror.on("paste", (editor, event) => {
      new InscrybeInsertImage(event, editor).paste()
    })
  }

  addAriaLabels() {
    const codemirrorTextarea = this.codemirror.getInputField()

    for (const attribute of this.element.attributes) {
      if (!attribute.name.startsWith("aria-")) continue
      codemirrorTextarea.setAttribute(attribute.name, attribute.value)
    }
  }

  addSepartorRoles() {
    const separators = this.mde.gui.toolbar.querySelectorAll(".separator")

    separators.forEach(element => {
      element.role = "separator"
    })
  }

  insertHighlight() {
    const selectedText = this.codemirror.getSelection()
    const text = selectedText || "text"
    const output = `==${text}==`

    this.codemirror.replaceSelection(output)
  }

  insertGallery() {
    const output = "[gallery {\n  \"Gallery Item 1\": \"https://\",\n  \"Gallery Item 2\": \"https://\"\n}]"

    this.codemirror.replaceSelection(output)
  }

  insertUpdateNotes() {
    const output = `<!-- Update notes are formatted to look like the official patch notes. Replace each value with the hero, ability, or text you want. Each value is optional and can be left out entirely. Icons can be overridden using the "icons" section. Specify each icon with the ability name to replace. This can be either another ability name or a URL to a custom image. When using a url it should start with "https://" -->
[update {
  hero: "Reinhardt",
  title: "Optional title to change the hero name, remove to default to the hero name",
  description: "A description on why changes were made",
  abilities: {
    "Charge": [
      "Some change you made to this ability",
    ],
    "Fire Strike": [
      "Some change you made to this ability",
      "Some other change you made to this ability"
    ]
  },
  icons: {
    "Charge": "Blizzard"
  }
}]`

    this.codemirror.replaceSelection(output)
  }

  insertHeroIconSelect() {
    const button = this.mde.gui.toolbar.querySelector(".fa-hero-icon").closest("button")

    button.classList.toggle("dropdown-open")

    if (button.classList.contains("dropdown-open")) {
      const dropdownElement = document.createElement("div")
      dropdownElement.classList.add("editor-dropdown")

      const sizesElement = document.createElement("div")
      sizesElement.classList.add("p-1/8")

      ;["Small", "Medium", "Large"].forEach((size, i) => {
        const id = `hero_select_size_${size}`

        const sizeItemElement = document.createElement("div")
        sizeItemElement.classList.add("checkbox")

        const checkboxElement = document.createElement("input")
        checkboxElement.type = "radio"
        checkboxElement.value = size.toLowerCase()
        checkboxElement.checked = i === 0
        checkboxElement.name = "hero_select_size"
        checkboxElement.id = id

        const labelElement = document.createElement("label")
        labelElement.for = name
        labelElement.innerText = size

        sizeItemElement.addEventListener("click", event => {
          event.preventDefault()
          event.stopPropagation()

          checkboxElement.checked = true
        })

        sizeItemElement.append(checkboxElement)
        sizeItemElement.append(labelElement)
        sizesElement.append(sizeItemElement)
      })

      dropdownElement.append(sizesElement)

      const separatorElement = document.createElement("hr")
      separatorElement.classList.add("mt-1/8")
      separatorElement.classList.add("mb-1/8")
      dropdownElement.append(separatorElement)

      const heroes = JSON.parse(this.element.dataset.heroes)
      heroes.forEach(hero => {
        const heroElement = document.createElement("div")
        heroElement.classList.add("editor-dropdown__item")
        heroElement.innerText = hero

        heroElement.addEventListener("click", () => {
          const size = document.querySelector("[name='hero_select_size']:checked").value
          const sizeString = size === "small" ? "" : ` { size: "${size}" }`

          this.codemirror.replaceSelection(`[hero ${hero}${sizeString}]`)
        })

        dropdownElement.append(heroElement)
      })

      button.append(dropdownElement)

      this.positionDropdown(dropdownElement)
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
    markerElement.innerHTML = "<div class='well well--dark'>Loading block...</div>"

    const marker = this.codemirror.markText({ line: lineNumber || position.line - 1, ch: 0 }, { line: lineNumber || position.line, ch: charCount }, {
      replacedWith: markerElement,
      addToHistory: existingBlock,
      inclusiveLeft: false,
      inclusiveRight: false
    })

    new FetchRails("/blocks/show_or_create", { name: name, id: blockId })
      .post().then(data => {
        marker.widgetNode.innerHTML = data

        const blockId = marker.widgetNode.querySelector("[data-id]").dataset.id
        marker.lines[0].text = `[block ${blockId}]`

        this.bindBlockEvents(marker)
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

        this.insertBlock("", false, match[1], lineNumber, match[0].length)
      }

      lineNumber++
    })
  }

  bindBlockEvents(marker) {
    const sortableElement = marker.widgetNode.querySelector("[data-role~='sortable']")
    const insertBlockTemplateElement = marker.widgetNode.querySelector("[data-action~='insert-block-template']")

    if (sortableElement) buildInputSortable(sortableElement)
    if (insertBlockTemplateElement) insertBlockTemplateElement.addEventListener("click", insertBlockTemplate)

    document.removeAndAddEventListener("click", event => {
      if (event.target?.dataset.action != "remove-block-template") return
      removeBlockTemplate(event)
    })
  }

  toggleImageUploader() {
    const button = this.mde.gui.toolbar.querySelector(".fa-image").closest("button")

    button.classList.toggle("dropdown-open")

    if (!button.classList.contains("dropdown-open")) {
      button.querySelector(".editor-dropdown").remove()
      return
    }

    const dropdownElement = document.createElement("div")
    dropdownElement.classList.add("editor-dropdown")

    const textElement = document.createElement("small")
    textElement.innerText = "Upload an image. Alternatively, with an image on your clipboard simply paste it in the text area."

    const randomId = Math.random().toString().substr(2, 8)
    const labelElement = document.createElement("label")
    const labelClasslist = ["button", "button--small", "mt-1/4", "w-100"]
    labelElement.for = randomId
    labelElement.innerText = "Upload image"
    labelElement.classList.add(...labelClasslist)

    const inputElement = document.createElement("input")
    inputElement.type = "file"
    inputElement.id = randomId
    inputElement.accept = "image/png, image/jpeg"
    inputElement.classList.add("hidden-field")

    inputElement.addEventListener("change", event => { new InscrybeInsertImage(event, this.codemirror).input() })
    labelElement.addEventListener("click", () => { inputElement.click() })

    document.body.append(inputElement)

    textElement.append(labelElement)
    dropdownElement.append(textElement)
    button.append(dropdownElement)

    this.positionDropdown(dropdownElement)
  }

  toggleVideoUploader() {
    const button = this.mde.gui.toolbar.querySelector(".fa-video").closest("button")

    button.classList.toggle("dropdown-open")

    if (!button.classList.contains("dropdown-open")) {
      button.querySelector(".editor-dropdown").remove()
      return
    }

    const dropdownElement = document.createElement("div")
    dropdownElement.classList.add("editor-dropdown")

    const textElement = document.createElement("small")
    textElement.innerText = "Upload a video. Limited to mp4 filetype and 50mb filesize."

    const randomId = Math.random().toString().substr(2, 8)
    const labelElement = document.createElement("label")
    const labelClasslist = ["button", "button--small", "mt-1/8", "w-100"]
    labelElement.for = randomId
    labelElement.innerText = "Upload video"
    labelElement.classList.add(...labelClasslist)

    const inputElement = document.createElement("input")
    inputElement.type = "file"
    inputElement.id = randomId
    inputElement.accept = "video/mp4"
    inputElement.classList.add("hidden-field")

    inputElement.addEventListener("change", event => new InscrybeInsertVideo(event, this.codemirror).input())
    labelElement.addEventListener("click", () => inputElement.click())

    const autoplayCheckboxElement = document.createElement("div")
    autoplayCheckboxElement.classList.add("switch-checkbox", "mt-1/8", "mb-1/8")
    autoplayCheckboxElement.addEventListener("click", event => {
      event.preventDefault()
      event.stopPropagation()

      const checkbox = event.target.closest(".switch-checkbox")
      if (!checkbox) return
      const input = document.querySelector("#autoplay" + randomId)
      if (input) input.checked = !input.checked
      checkbox.classList.toggle("switch-checkbox--active", input.checked)
    })

    const autoplayLabelElement = document.createElement("label")
    autoplayLabelElement.classList.add("switch-checkbox__label")
    autoplayLabelElement.innerText = "Loop and autoplay on mute"
    autoplayLabelElement.for = "autoplay" + randomId

    const autoplayInputElement = document.createElement("input")
    autoplayInputElement.classList.add("switch-checkbox__input")
    autoplayInputElement.type = "checkbox"
    autoplayInputElement.id = "autoplay" + randomId

    autoplayCheckboxElement.append(autoplayLabelElement)

    document.body.append(autoplayInputElement)
    document.body.append(inputElement)

    textElement.append(autoplayCheckboxElement)
    textElement.append(labelElement)
    dropdownElement.append(textElement)
    button.append(dropdownElement)

    this.positionDropdown(dropdownElement)
  }

  toggleWikiSearch() {
    const button = this.mde.gui.toolbar.querySelector(".fa-wiki").closest("button")

    button.classList.toggle("dropdown-open")

    if (!button.classList.contains("dropdown-open")) {
      button.querySelector(".editor-dropdown").remove()
      return
    }
    const dropdownElement = document.createElement("div")
    dropdownElement.classList.add("editor-dropdown")

    dropdownElement.innerHTML = `
      <small>Search the Wiki and insert a link to an article.</small>
      <input type="text" class="form-input bg-darker" placeholder="Search the Wiki" />
      <div data-role="results"></div>
    `

    button.append(dropdownElement)

    const input = button.querySelector("input")
    input.focus()

    input.addEventListener("click", event => {
      event.stopPropagation()
      event.preventDefault()

      input.focus()
    })

    const getSearchResults = debounce(event => {
      if (!event.target.value) return

      const resultsElement = button.querySelector("[data-role='results']")
      resultsElement.innerHTML = "<small>Searching...</small>"

      new FetchRails(`/wiki/search/${event.target.value}.json`).get()
        .then(data => {
          data = JSON.parse(data)
          resultsElement.innerHTML = ""

          if (!data.length) {
            resultsElement.innerHTML = "<small>No results found</small>"
            return
          }

          data.forEach(item => {
            const itemElement = document.createElement("a")
            itemElement.classList.add("editor-dropdown__item")
            itemElement.innerText = item.title
            itemElement.addEventListener("click", () => { this.insertLink(`/wiki/articles/${decodeURIComponent(item.slug)}`) })

            const categoryElement = document.createElement("span")
            categoryElement.style = "opacity: .5; font-size: .8em"
            categoryElement.innerText = " " + item.category.title

            itemElement.append(categoryElement)
            resultsElement.append(itemElement)
          })
        })
    }, 500)

    input.addEventListener("input", getSearchResults)
  }

  insertLink(link = "") {
    const selectedText = this.codemirror.getSelection()
    const text = selectedText || "text"
    const output = `[${text}](${link})`

    this.codemirror.replaceSelection(output)
  }

  positionDropdown(element) {
    const { left } = element.getBoundingClientRect()
    const offset = 20

    if (left - 10 < 0) element.style.right = `${left - offset}px`
  }

  possiblyCloseDropdown(element) {
    const openDropdownButtons = document.querySelectorAll(".dropdown-open")

    openDropdownButtons.forEach(button => {
      if (element === button) return
      if (button.contains(element)) return

      button.classList.remove("dropdown-open")
      button.querySelector(".editor-dropdown")?.remove()
    })
  }
}

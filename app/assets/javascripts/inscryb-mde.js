//= require inscrybmde/dist/inscrybmde.min.js

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-role~='simple-mde']")

  elements.forEach((element) => {
    const mde = new InscrybMDE({
      element: element,
      autoDownloadFontAwesome: false,
      autofocus: false,
      forceSync: true,
      blockStyles: {
        italic: "_"
      },
      status: false,
      spellChecker: false,
      insertTexts: {
        table: ["", "\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n"]
      },
      toolbar: [
        "bold",
        "italic",
        {
          name: "highlight",
          action: function customFunction(editor) {
            let output = ""
            const cm = editor.codemirror
            const selectedText = cm.getSelection()
            const text = selectedText || "text"

            output = "==" + text + "=="
            cm.replaceSelection(output)
          },
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
        "image",
        "|",
        "table",
        {
          name: "gallery",
          action: function customFunction(editor) {
            const cm = editor.codemirror

            output = '[gallery {\n  "Gallery Item 1": "https://",\n  "Gallery Item 2": "https://"\n}]'
            cm.replaceSelection(output)
          },
          className: "fa fa-gallery",
          title: "Gallery"
        },
        {
          name: "hero-icon",
          action: function customFunction(editor) {
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
          },
          className: "fa fa-hero-icon",
          title: "Hero Icon (Use English Hero name). Simple names are ok (Torbjörn -> Torbjorn)"
        },
        "|",
        "fullscreen"
      ]
    })
  })
})

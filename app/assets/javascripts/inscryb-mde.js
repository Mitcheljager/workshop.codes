//= require inscrybmde/dist/inscrybmde.min.js

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-role='simple-mde']")

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
            const text = selectedText || "placeholder"

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
          name: "Gallery",
          action: function customFunction(editor) {
            const cm = editor.codemirror

            output = '[gallery {\n  "Gallery Item 1": "https://",\n  "Gallery Item 2": "https://"\n}]'
            cm.replaceSelection(output)
          },
          className: "fa fa-gallery",
          title: "Gallery"
        },
        "|",
        "fullscreen"
      ]
    })
  })
})

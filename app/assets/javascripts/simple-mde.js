//= require simplemde/dist/simplemde.min.js


(() => {
  const elements = document.querySelectorAll("[data-role='simple-mde']")

  elements.forEach((element) => {
    const mde = new SimpleMDE({
      element: element,
      autoDownloadFontAwesome: false,
      autofocus: false,
      forceSync: true,
      blockStyles: {
        italic: "_"
      },
      status: false,
      spellChecker: false,
      toolbar: [
        "bold",
        "italic",
        {
          name: "custom",
          action: function customFunction(editor) {
            var cm = editor.codemirror;
            var output = '';
            var selectedText = cm.getSelection();
            var text = selectedText || 'placeholder';

            output = '==' + text + '==';
            cm.replaceSelection(output);
          },
          className: "fa fa-highlight",
          title: "Highlight",
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
        "image"
      ]
    })
  })
})()

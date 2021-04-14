document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-action='markdown-preview']")

  if (!element) return

  element.removeAndAddEventListener("click", toggleMarkdownPreview)
})

function toggleMarkdownPreview(event) {
  event.preventDefault()

  const modalElement = document.querySelector("[data-modal~='markdown-preview']")
  const textareaElement = document.querySelector("[data-role~='markdown-textarea']")
  const descriptionElement = document.querySelector("[data-role~='markdown-preview']")

  modalElement.style.display = "flex"
  sendParseRequest(descriptionElement, textareaElement)
}

function sendParseRequest(descriptionElement, textareaElement) {
  const descriptionValue = textareaElement.value

  descriptionElement.innerHTML = "Loading preview..."

  new FetchRails("/parse-markdown", { post: { description: descriptionValue } })
  .post().then(data => {
    descriptionElement.innerHTML = data
  })
}

document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-action='markdown-preview']")

  if (!element) return

  element.addEventListener("click", toggleMarkdownPreview)
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

  fetch("/parse-markdown", {
    method: "post",
    body: JSON.stringify({ post: { description: descriptionValue } }),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    descriptionElement.innerHTML = data
  })
}

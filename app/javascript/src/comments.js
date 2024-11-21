import FetchRails from "@src/fetch-rails"

export function bind() {
  document.body.removeAndAddEventListener("click", getMoreComments)
}

function getMoreComments(event) {
  let eventTarget = event.target
  if (eventTarget.dataset.action != "get-more-comments") eventTarget = event.target.closest("[data-action~='get-more-comments']")
  if (!eventTarget) return

  const parent = event.target.closest("[data-role='comments']")
  const button = parent.querySelector("[data-action~='get-more-comments']")
  const buttonParent = parent.querySelector("[data-role~='load-more']")
  const id = parent.dataset.id
  const page = parseInt(parent.dataset.page)
  const commentsCount = parseInt(parent.dataset.commentsCount)
  const initialText = button.innerText

  if (parent.dataset.loading === "true") return

  parent.loading = "true"
  button.innerText = "Loading..."
  button.disabled = true

  new FetchRails(`/comments/${id}/${page + 1}`).get().then(data => {
    buttonParent.insertAdjacentHTML("beforeBegin", data)

    if (parent.querySelectorAll("[data-comment]").length >= commentsCount) buttonParent.remove()
  }).finally(() => {
    button.innerText = initialText
    parent.dataset.page = page + 1
    button.disabled = false
  })
}

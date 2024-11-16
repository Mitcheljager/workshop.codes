import FetchRails from "@src/fetch-rails"

export function bind() {
  document.body.removeAndAddEventListener("click", getMoreComments)
}

function getMoreComments(event: Event) {
  let eventTarget = event.target as HTMLElement | null | undefined
  if (eventTarget?.dataset.action != "get-more-comments") eventTarget = eventTarget?.closest("[data-action~='get-more-comments']")
  if (!eventTarget) return

  const parent = eventTarget.closest("[data-role='comments']") as HTMLElement
  const button = parent.querySelector("[data-action~='get-more-comments']") as HTMLButtonElement
  const buttonParent = parent.querySelector("[data-role~='load-more']")
  const id = parent.dataset.id
  const page = parseInt(parent.dataset.page || "0")
  const commentsCount = parseInt(parent.dataset.commentsCount || "0")
  const initialText = button.innerText || ""

  if (parent.dataset.loading === "true") return

  parent.dataset.loading = "true"
  button.innerText = "Loading..."
  button.disabled = true

  new FetchRails(`/comments/${id}/${page + 1}`).get().then(data => {
    if (data) buttonParent!.insertAdjacentHTML("beforebegin", data)

    console.log(parent.querySelectorAll("[data-comment]").length, commentsCount)

    if (parent.querySelectorAll("[data-comment]").length >= commentsCount) buttonParent!.remove()
  }).finally(() => {
    button.innerText = initialText
    parent.dataset.page = (page + 1).toString()
    button.disabled = false
    parent.dataset.loading = "false"
  })
}

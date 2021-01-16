document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role~='comments']")

  if (!element) return

  getComments(element)
})

function getComments(element) {
  const id = element.dataset.id

  fetch(`/comments/${ id }`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    element.innerHTML = data
  })
}

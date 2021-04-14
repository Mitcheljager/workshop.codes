document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role~='comments']")

  if (!element) return

  getComments(element)
})

function getComments(element) {
  const id = element.dataset.id

  new FetchRails(`/comments/${ id }`).get()
  .then(data => {
    element.innerHTML = data
  })
}

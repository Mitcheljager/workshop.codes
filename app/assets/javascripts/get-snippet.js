document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='load-snippet']")

  elements.forEach((element) => element.removeAndAddEventListener("click", loadSnippet))
})

function loadSnippet(event) {
  event.preventDefault()

  if (this.dataset.retrieved == "true") return

  this.dataset.retrieved = true

  const id = this.dataset.id

  new FetchRails("/get-snippet", { id: id })
  .post().then(data => {
    const element = document.querySelector("[data-role~='ide-content']")
    element.innerHTML = data

    initiateIde(element)
  })
}

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='load-snippet']")

  elements.forEach((element) => element.removeEventListener("click", loadSnippet))
  elements.forEach((element) => element.addEventListener("click", loadSnippet))
})

function loadSnippet(event) {
  event.preventDefault()

  if (this.dataset.retrieved == "true") return

  this.dataset.retrieved = true

  const id = this.dataset.id

  fetch("/get-snippet", {
    method: "post",
    body: JSON.stringify({ id: id }),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    const element = document.querySelector("[data-role~='snippet-container']")
    element.innerHTML = data

    initiateIde(element.querySelector("[data-role~='ide-content']"))
  })
}

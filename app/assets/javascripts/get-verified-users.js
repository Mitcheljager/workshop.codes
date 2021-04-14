document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-action~='get-verified-users']")

  if (!element) return

  element.removeAndAddEventListener("click", getVerifiedUsers)
})

function getVerifiedUsers(event) {
  event.preventDefault()

  if (this.dataset.authorsLoaded == "true") return

  this.dataset.authorsLoaded = true

  new FetchRails("/get-verified-users").get().then(data => {
    const element = document.querySelector("[data-role='filter-authors']")

    element.innerHTML = data

    const elements = element.querySelectorAll("[data-action='add-filter']")
    elements.forEach((element) => element.addEventListener("click", addFilter))
  })
}

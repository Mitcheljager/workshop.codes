import FetchRails from "./fetch-rails"

export function bind() {
  const element = document.querySelector("[data-action~='get-verified-users']")

  if (!element) return

  element.removeAndAddEventListener("click", getVerifiedUsers)
}

function getVerifiedUsers(event) {
  event.preventDefault()

  if (this.dataset.authorsLoaded == "true") return

  this.dataset.authorsLoaded = true

  new FetchRails("/get-verified-users").get().then(data => {
    const element = document.querySelector("[data-role='filter-authors']")

    element.innerHTML = data
  })
}

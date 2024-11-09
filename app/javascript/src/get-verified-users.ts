import FetchRails from "@src/fetch-rails"

export function bind() {
  const element = document.querySelector("[data-action~='get-verified-users']")

  if (!element) return

  element.removeAndAddEventListener("click", getVerifiedUsers)
}

function getVerifiedUsers(event: Event) {
  event.preventDefault()

  const target = event.target as HTMLElement

  if (target.dataset.authorsLoaded == "true") return

  target.dataset.authorsLoaded = "true"

  new FetchRails("/get-verified-users").get().then(data => {
    const element = document.querySelector("[data-role='filter-authors']") as HTMLElement

    element.innerHTML = data
  })
}

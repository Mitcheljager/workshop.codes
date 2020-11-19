document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-action~='get-verified-users']")

  if (!element) return

  element.removeEventListener("click", getVerifiedUsers)
  element.addEventListener("click", getVerifiedUsers)
})

function getVerifiedUsers(event) {
  event.preventDefault()

  if (this.dataset.authorsLoaded == "true") return

  this.dataset.authorsLoaded = true

  fetch("/get-verified-users", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    const element = document.querySelector("[data-role='filter-authors']")

    element.innerHTML = data

    const elements = element.querySelectorAll("[data-action='add-filter']")
    elements.forEach((element) => element.addEventListener("click", addFilter))
  })
}

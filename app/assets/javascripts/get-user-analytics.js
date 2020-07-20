document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-action~='get-user-analytics']")

  if (!element) return

  element.removeEventListener("change", () => { getUserAnalytics(element) })
  element.addEventListener("change", () => { getUserAnalytics(element) })

  getUserAnalytics(element)
})

function getUserAnalytics(element) {
  if (event) event.preventDefault()

  fetch("/analytics/user", {
    method: "post",
    body: JSON.stringify({ type: element.value }),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    const parsedData = JSON.parse(data)

    const target = document.querySelector("[data-role~='chart']")

    target.dataset.labels = JSON.stringify(Object.keys(parsedData))
    target.dataset.values = JSON.stringify(Object.values(parsedData))

    createChart(target)
  })
}

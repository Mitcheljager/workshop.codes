document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='load-analytics']")

  elements.forEach((element) => element.removeEventListener("click", loadAnalytics))
  elements.forEach((element) => element.addEventListener("click", loadAnalytics))
})

function loadAnalytics(event) {
  event.preventDefault()

  if (this.dataset.retrieved == "true") return

  this.dataset.retrieved = true

  const id = this.dataset.id

  fetch("/get-analytics", {
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
    const parsedData = JSON.parse(data)
    const analyticsTypes = [
      "daily-copies",
      "daily-views",
      "hourly-copies",
      "hourly-views"
    ]

    analyticsTypes.forEach(type => {
      const target = document.querySelector(`[data-${ type }-analytics="${ id }"]`)

      target.dataset.labels = JSON.stringify(Object.keys(parsedData[type]))
      target.dataset.values = JSON.stringify(Object.values(parsedData[type]))

      createChart(target)
    })
  })
}

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='get-post-analytics']")
  elements.forEach(element => { element.removeEventListener("change", () => { getPostAnalytics(element) }) })
  elements.forEach(element => { element.addEventListener("change", () => { getPostAnalytics(element) }) })

  const revealElements = document.querySelectorAll("[data-action='toggle-content reveal-post-analytics']")
  revealElements.forEach(element => { element.removeEventListener("click", revealPostAnalytics) })
  revealElements.forEach(element => { element.addEventListener("click", revealPostAnalytics) })
})

function getPostAnalytics(element) {
  if (event) event.preventDefault()

  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  fetch("/analytics/post", {
    method: "post",
    body: JSON.stringify({ type: element.value, id: element.dataset.postId }),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    const parsedData = JSON.parse(data)

    const parent = element.closest("[data-post-analytics]")
    const target = parent.querySelector("[data-role~='chart']")

    target.dataset.labels = JSON.stringify(Object.keys(parsedData))
    target.dataset.values = JSON.stringify(Object.values(parsedData))

    Chart.helpers.each(Chart.instances, chart => {
      if (chart.canvas == target) chart.destroy()
    })

    createChart(target)
  }).finally(() => {
    progressBar.setValue(1)
    progressBar.hide()
  })
}

function revealPostAnalytics(event) {
  const parentElement = this.closest("[data-toggle-content]")
  const selectElement = parentElement.querySelector("[data-action~='get-post-analytics']")

  const changeEvent = new Event("change")
  selectElement.dispatchEvent(changeEvent)
}

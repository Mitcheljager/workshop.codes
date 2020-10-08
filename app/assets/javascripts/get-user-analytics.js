document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-action~='get-user-analytics']")

  if (!element) return

  element.removeEventListener("change", () => { getUserAnalytics(element) })
  element.addEventListener("change", () => { getUserAnalytics(element) })

  getUserAnalytics(element)
})

function getUserAnalytics(element) {
  if (event) event.preventDefault()

  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  const target = document.querySelector("[data-role~='chart']")
  target.insertAdjacentHTML("afterBegin", `<div class="chart__placeholder"><div class="spinner"></div></div>`)

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
    target.querySelector(".chart__placeholder").remove()

    createChart(target, parsedData)
  }).finally(() => {
    progressBar.setValue(1)
    progressBar.hide()
  })
}

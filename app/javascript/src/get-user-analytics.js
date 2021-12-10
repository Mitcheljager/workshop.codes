import FetchRails from "./fetch-rails"
import createChart from "./chart"

export function bind() {
  const element = document.querySelector("[data-action~='get-user-analytics']")

  if (!element) return

  element.removeAndAddEventListener("change", () => { getUserAnalytics(element) })

  getUserAnalytics(element)
}

function getUserAnalytics(element) {
  if (event) event.preventDefault()

  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  const target = document.querySelector("[data-role~='chart']")
  target.insertAdjacentHTML("afterBegin", "<div class='chart__placeholder'><div class='spinner'></div></div>")

  new FetchRails("/analytics/user", { type: element.value })
    .post().then(data => {
      const parsedData = JSON.parse(data)
      target.querySelector(".chart__placeholder").remove()

      createChart(target, parsedData)
    }).finally(() => {
      progressBar.setValue(1)
      progressBar.hide()
    })
}

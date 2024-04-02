import FetchRails from "./fetch-rails"
import createChart from "./chart"

export function bind() {
  const elements = document.querySelectorAll("[data-action~='get-post-analytics']")
  elements.forEach(element => { element.removeAndAddEventListener("change", () => { getPostAnalytics(element) }) })

  const revealElements = document.querySelectorAll("[data-action='toggle-content reveal-post-analytics']")
  revealElements.forEach(element => { element.removeAndAddEventListener("click", revealPostAnalytics) })
}

function getPostAnalytics(element) {
  if (event) event.preventDefault()

  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  const parent = element.closest("[data-post-analytics]")
  const target = parent.querySelector("[data-role~='chart']")
  target.insertAdjacentHTML("afterBegin", "<div class='chart__placeholder'><div class='spinner'></div></div>")

  new FetchRails("/analytics/post", { type: element.value, id: element.dataset.postId })
    .post().then(data => {
      const parsedData = JSON.parse(data)
      target.querySelector(".chart__placeholder").remove()

      createChart(target, parsedData, "%Y-%m-%d %H:00", [], "bar")
    }).finally(() => {
      progressBar.setValue(1)
      progressBar.hide()
    })
}

function revealPostAnalytics() {
  const parentElement = this.closest("[data-toggle-content]")
  const selectElement = parentElement.querySelector("[data-action~='get-post-analytics']")

  const changeEvent = new Event("change")
  selectElement.dispatchEvent(changeEvent)
}

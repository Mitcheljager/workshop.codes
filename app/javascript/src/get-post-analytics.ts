import FetchRails from "@src/fetch-rails"
import createChart from "@src/chart"

export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='get-post-analytics']")
  elements.forEach(element => element.removeAndAddEventListener("change", (event: Event) => getPostAnalytics(event)))

  const revealElements = document.querySelectorAll("[data-action='toggle-content reveal-post-analytics']")
  revealElements.forEach(element => element.removeAndAddEventListener("click", revealPostAnalytics))
}

function getPostAnalytics(event: Event): void {
  if (event) event.preventDefault()

  const currentTarget = event.currentTarget as HTMLFormElement

  // @ts-ignore
  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  const parent = currentTarget.closest("[data-post-analytics]")
  const target = parent?.querySelector("[data-role~='chart']") as HTMLElement

  if (!target) throw new Error("target was not found in getPostAnalytics")

  target.insertAdjacentHTML("afterbegin", "<div class='chart__placeholder'><div class='spinner'></div></div>")

  new FetchRails("/analytics/post", { type: currentTarget.value, id: currentTarget.dataset.postId })
    .post().then(data => {
      const parsedData = JSON.parse(data)
      target.querySelector(".chart__placeholder")?.remove()

      createChart(target, parsedData, "%Y-%m-%d %H:00")
    }).finally(() => {
      progressBar.setValue(1)
      progressBar.hide()
    })
}

function revealPostAnalytics({ currentTarget }: { currentTarget: HTMLElement }): void {
  const parentElement = currentTarget.closest("[data-toggle-content]")
  if (!parentElement) throw new Error("parentElement was not found in revealPostAnalytics")

  const selectElement = parentElement.querySelector("[data-action~='get-post-analytics']")
  if (!selectElement) throw new Error("selectElement was not found in revealPostAnalytics")

  const changeEvent = new Event("change")
  selectElement.dispatchEvent(changeEvent)
}

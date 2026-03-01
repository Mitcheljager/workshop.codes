import FetchRails from "@src/fetch-rails"
import createChart from "@src/chart"

export function bind(): void {
  const typeSelect = document.querySelector<HTMLSelectElement>("[data-action~='set-user-analytics-type']")
  const timeframeSelect = document.querySelector<HTMLSelectElement>("[data-action~='set-user-analytics-timeframe']")

  if (!typeSelect || !timeframeSelect) return

  typeSelect.removeAndAddEventListener("change", (event: Event) => getUserAnalytics(event, typeSelect, timeframeSelect))
  timeframeSelect.removeAndAddEventListener("change", (event: Event) => getUserAnalytics(event, typeSelect, timeframeSelect))

  getUserAnalytics(null, typeSelect, timeframeSelect)
}

function getUserAnalytics(event: Event | null, typeSelect: HTMLSelectElement, timeframeSelect: HTMLSelectElement): void {
  if (event) event.preventDefault()

  const target = document.querySelector<HTMLElement>("[data-role~='chart']")!
  if (target) target.insertAdjacentHTML("afterbegin", "<div class='chart__placeholder'><div class='spinner'></div></div>")

  new FetchRails("/analytics/user", { type: typeSelect.value, from: timeframeSelect.value })
    .post().then(data => {
      if (target) target.querySelector(".chart__placeholder")?.remove()

      const parsedData = JSON.parse(data as string)
      createChart(target, parsedData)
    })
}

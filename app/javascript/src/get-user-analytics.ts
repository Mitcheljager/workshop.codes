import FetchRails from "@src/fetch-rails"
import createChart from "@src/chart"

export function bind(): void {
  const element = document.querySelector("[data-action~='get-user-analytics']") as HTMLFormElement

  if (!element) return

  element.removeAndAddEventListener("change", (event: Event) => getUserAnalytics(event, element))

  getUserAnalytics(null, element)
}

function getUserAnalytics(event: Event | null, element: HTMLFormElement): void {
  if (event) event.preventDefault()

  const target = document.querySelector("[data-role~='chart']") as HTMLElement
  if (target) target.insertAdjacentHTML("afterbegin", "<div class='chart__placeholder'><div class='spinner'></div></div>")

  new FetchRails("/analytics/user", { type: element.value })
    .post().then(data => {
      if (target) target.querySelector(".chart__placeholder")?.remove()

      const parsedData = JSON.parse(data as string)
      createChart(target, parsedData)
    })
}

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

  const parent = currentTarget.closest("[data-post-analytics]")
  const target = parent?.querySelector<HTMLElement>("[data-role~='chart']")

  if (!target) throw new Error("target was not found in getPostAnalytics")

  target.insertAdjacentHTML("afterbegin", "<div class='chart__placeholder'><div class='spinner'></div></div>")

  new FetchRails("/analytics/post", { type: currentTarget.value, id: currentTarget.dataset.postId })
    .post().then(data => {
      const parsedData = JSON.parse(data as string)
      target.querySelector(".chart__placeholder")?.remove()

      createChart(target, parsedData, "%Y-%m-%d %H:00")
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

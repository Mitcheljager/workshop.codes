import Athena from "./athena"

export function initialize(): void {
  const elements = document.querySelectorAll<HTMLElement>("[data-track-on-load]")

  elements.forEach((element) => {
    const eventName = element.dataset.trackOnLoad || ""
    const properties = JSON.parse(element.dataset.properties || "{}")

    new Athena().track(eventName, properties)
  })
}

import * as timeago from "timeago.js"

export function initialize(): void {
  const elements = Array.from(document.querySelectorAll("[data-role~='timeago']")) as HTMLElement[]

  if (elements.length) timeago.render(elements)

  const staticElements = Array.from(elements.values()).filter((element) => element.matches("[data-role~='timeago-static']"))
  if (staticElements.length) staticElements.forEach((element) => timeago.cancel(element))
}

import * as timeago from "timeago.js"

export function render() {
  const elements = document.querySelectorAll("[data-role~='timeago']")

  if (elements.length) timeago.render(elements)

  const staticElements = Array.from(elements.values()).filter((element) => element.matches("[data-role~='timeago-static']"))
  if (staticElements.length) staticElements.forEach((element) => timeago.cancel(element))
}

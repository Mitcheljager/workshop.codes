import * as timeago from "timeago.js"

export function render() {
  const elements = document.querySelectorAll("[data-role='timeago']")

  if (elements.length) timeago.render(elements)
}

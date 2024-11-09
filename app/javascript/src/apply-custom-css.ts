export function bind() {
  const elements = document.querySelectorAll("[data-action='apply-custom-css']")

  elements.forEach((element) => element.removeAndAddEventListener("input", applyCustomCSS))
}

function applyCustomCSS({ currentTarget }: { currentTarget: HTMLFormElement }) {
  const value = currentTarget.value
  const styleTag = document.querySelector("#custom-css")

  if (styleTag) styleTag.textContent = value
}

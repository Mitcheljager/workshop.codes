export function bind(): void {
  const elements = document.querySelectorAll("[data-action='apply-custom-css']")

  elements.forEach((element) => element.removeAndAddEventListener("input", applyCustomCSS))
}

function applyCustomCSS({ currentTarget }: { currentTarget: HTMLFormElement }): void {
  const value = currentTarget.value
  const styleTag = document.querySelector("#custom-css")

  styleTag!.textContent = value
}

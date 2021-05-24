export function bind() {
  const elements = document.querySelectorAll("[data-action~='set-css-variable']")

  elements.forEach(element => {
    element.removeAndAddEventListener("input", setCssVariable)
  })
}

export default function setCssVariable(event) {
  event.preventDefault()
  const targetElement = document.querySelector(`[data-css-variable="${ this.dataset.target }"]`)

  targetElement.style.setProperty(`--${ this.dataset.variable }`, this.value + "px")
}

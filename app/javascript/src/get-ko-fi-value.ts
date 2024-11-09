import FetchRails from "@src/fetch-rails"

export function render() {
  const element = document.querySelector("[data-role~='ko-fi-progress']") as HTMLElement

  if (element) getKoFiValue(element)
}

function getKoFiValue(element: HTMLElement) {
  new FetchRails("/webhooks/get_ko_fi_value").get().then(data => {
    const parsedData = parseInt(data)
    const max = parseInt(element.dataset.max || "0")
    const labelElement = document.querySelector("[data-ko-fi-progress-label]") as HTMLFormElement
    const value = Math.floor(100 / max * parsedData)

    element.style.width = Math.min(value, 100) + "%"
    labelElement.innerText = value + "%" + (value >= 100 ? ", Thank you!" : "")
  })
}

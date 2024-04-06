import FetchRails from "@src/fetch-rails"

export function render() {
  const element = document.querySelector("[data-role~='ko-fi-progress']")

  if (element) getKoFiValue(element)
}

function getKoFiValue(element) {
  new FetchRails("/webhooks/get_ko_fi_value").get().then(data => {
    const parsedData = parseInt(data)
    const max = parseInt(element.dataset.max)
    const labelElement = document.querySelector("[data-ko-fi-progress-label]")
    const value = Math.floor(100 / max * parsedData)

    element.style.width = Math.min(value, 100) + "%"
    labelElement.innerText = value + "%" + (value >= 100 ? ", Thank you!" : "")
  })
}

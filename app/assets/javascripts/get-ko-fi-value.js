document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role~='ko-fi-progress']")

  if (element) getKoFiValue(element)
})

function getKoFiValue(element) {
  fetch("/webhooks/get_ko_fi_value", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    const parsedData = parseInt(data)
    const max = parseInt(element.dataset.max)
    const labelElement = document.querySelector("[data-ko-fi-progress-label]")
    const value = Math.floor(100 / max * parsedData)

    element.style.width = Math.min(value, 100) + "%"
    labelElement.innerText = value + "%" + (value >= 100 ? ", Thank you!" : "")
  })
}

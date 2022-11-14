export function addAlert(alertText, additionalAlertClasses = []) {
  const textNode = document.createElement("p")
  textNode.classList.add("mt-1/16", "mb-1/16")
  textNode.innerText = alertText

  const closeButton = document.createElement("button", { "data-role": "dismiss-parent" })
  closeButton.classList.add("button", "button--link", "p-0", "pl-1/16", "pr-1/16")
  closeButton.dataset.role = "dismiss-parent"
  closeButton.innerText = "✕"

  function dismissParent(event) {
    const parent = this.parentNode
    parent.classList.add("fade-out")
    setTimeout(() => {
      parent.remove()
    }, 500)
    event.preventDefault()
  }

  closeButton.addEventListener("click", dismissParent)

  const element = document.createElement("div")
  element.classList.add("alerts__alert", ...additionalAlertClasses)
  element.appendChild(textNode)
  element.appendChild(closeButton)

  const parent = document.querySelector("[data-role~='alerts']")
  parent.appendChild(element)
}

export function addAlertWarning(alertText) {
  addAlert(alertText, ["alerts__alert--warning"])
}

export function addAlertError(alertText) {
  addAlert(alertText, ["alerts__alert--error"])
}

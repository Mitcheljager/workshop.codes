export function addAlert(alertText, additionalAlertClasses = []) {
  window.dispatchEvent(new CustomEvent("alert", { detail: { text: alertText, type: additionalAlertClasses } }))
}

export function addAlertWarning(alertText) {
  addAlert(alertText, ["alert--warning"])
}

export function addAlertError(alertText) {
  addAlert(alertText, ["alert--error"])
}

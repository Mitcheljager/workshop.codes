export function addAlert(alertText: string, additionalAlertClasses: string[] = []): void {
  window.dispatchEvent(new CustomEvent("alert", { detail: { text: alertText, type: additionalAlertClasses } }))
}

export function addAlertWarning(alertText: string): void {
  addAlert(alertText, ["alert--warning"])
}

export function addAlertError(alertText: string): void {
  addAlert(alertText, ["alert--error"])
}

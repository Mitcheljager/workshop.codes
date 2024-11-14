export function setCssVariable(key: string, value: string) {
  document.body.style.setProperty(`--${key}`, value)
}

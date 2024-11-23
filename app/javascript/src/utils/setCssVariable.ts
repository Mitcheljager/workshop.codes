export function setCssVariable(key: string, value: string): void {
  document.body.style.setProperty(`--${key}`, value)
}

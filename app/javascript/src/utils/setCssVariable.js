export function setCssVariable(key, value) {
  document.body.style.setProperty(`--${key}`, value)
}

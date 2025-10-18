export function initialize(): void {
  const element = document.querySelector<HTMLElement>("[data-role~='focus-on-load']")

  element?.focus()
}

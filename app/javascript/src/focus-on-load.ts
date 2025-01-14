export function initialize(): void {
  const element = document.querySelector("[data-role~='focus-on-load']") as HTMLElement

  if (element) element.focus()
}

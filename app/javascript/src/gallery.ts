export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='set-gallery']")
  elements.forEach(element => element.removeAndAddEventListener("click", setGallery))
}

function setGallery({ currentTarget }: { currentTarget: HTMLElement }): void {
  const target = document.querySelector(`[data-gallery="${currentTarget.dataset.target}"]`) as HTMLImageElement

  if (!target) return

  target.src = ""
  target.src = currentTarget.dataset.url || ""
}

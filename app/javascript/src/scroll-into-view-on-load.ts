export function initialize(): void {
  const elements = Array.from(document.querySelectorAll("[data-role~='scroll-into-view-on-load']")) as HTMLElement[]

  elements.forEach(element => {
    const parent = element.closest("[data-scroll-container]")

    if (parent) parent.scrollTop = Math.max(element.offsetTop - 55, 0)
  })
}

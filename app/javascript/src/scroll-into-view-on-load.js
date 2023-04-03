export function initialize() {
  const elements = document.querySelectorAll("[data-role~='scroll-into-view-on-load']")

  elements.forEach(element => {
    const parent = element.closest("[data-scroll-container]")

    parent.scrollTop = Math.max(element.offsetTop - 55, 0)
  })
}

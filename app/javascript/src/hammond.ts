export function bind(): void {
  const element = document.querySelector<HTMLElement>("[data-role~='hammond']")

  if (!element) return

  window.removeEventListener("resize", () => position(element))
  window.addEventListener("resize", () => position(element))

  position(element)
  setTimeout(() => position(element), 100)
}

function position(element: HTMLElement): void {
  const background = document.querySelector<HTMLElement>(".body-bg, .wiki-header")

  if (!background) return

  const isWiki = background.classList.contains("wiki-header")

  if (isWiki) return

  const style = getComputedStyle(background)
  const height = parseInt(style.height)
  const width = parseInt(style.width)
  const clipPath = style.clipPath

  if (!clipPath || clipPath === "none") {
    element.style = `--top: ${height}px; display: block;`
    return
  }

  const clipPathOffset = parseInt(clipPath.split(", ")?.[2]?.trim().split(" ")[1] || "0")
  const offsetFromBottom = height - clipPathOffset

  const radians = Math.atan(offsetFromBottom / width)
  const angle = radians * 180 / Math.PI
  const randomDelay = Math.random() * 10000

  element.style = `--angle: ${-angle}deg; --top: ${height}px; display: block; --delay: ${randomDelay}ms`
}

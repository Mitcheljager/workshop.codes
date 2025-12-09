export function bind(): void {
  const element = document.querySelector<HTMLElement>("[data-role~='string-lights']")

  if (!element) return

  window.removeEventListener("resize", () => positionStringLights(element))
  window.addEventListener("resize", () => positionStringLights(element))

  // This is weirdly hacky, but turbolinks doesn't seem to like it when going from the main application to the wiki,
  // the height of the pseudo element is `auto` at first. So... we just fire it again after 100 milliseconds.
  // Doesn't do anything visually on other pages, but takes care of the positioning on wiki pages.
  positionStringLights(element)
  setTimeout(() => positionStringLights(element), 100)
}

// This is all a bit janky. The main application and the wiki have separate headers, the main application is angled the wiki is not.
// I wanted to keep them all in one function for the sake of keeping it simple.
// The string lights only show after javascript activates to prevent it from snapping to an angle before it loads.
function positionStringLights(element: HTMLElement): void {
  const background = document.querySelector<HTMLElement>(".body-bg, .wiki-header")

  if (!background) return

  const isWiki = background.classList.contains("wiki-header")
  const style = isWiki ? getComputedStyle(background, "::before") : getComputedStyle(background)
  const height = parseInt(style.height)
  const width = parseInt(style.width)
  const clipPath = style.clipPath

  if (!clipPath || clipPath === "none") {
    element.style = `--top: ${height}px; display: block;`
    return
  }

  // Get the third polygon of the clip path, and it's second value
  // Here: `0 0, 100% 0, 100% 280px, 0% 100%` we get "280px".
  // Fragile? Eh.
  const clipPathOffset = parseInt(clipPath.split(", ")?.[2]?.trim().split(" ")[1] || "0")
  const offsetFromBottom = height - clipPathOffset

  // Here we calculate the angle from the bottom left to that third polygon, also from the bottom
  // I honestly don't know what `atan` is. Trigenometry isn't my strong suit, I don't even know how to spell it.
  const radians = Math.atan(offsetFromBottom / width)
  const angle = radians * 180 / Math.PI

  element.style = `--angle: ${-angle}deg; --top: ${height}px; display: block;`
}

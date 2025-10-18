export function bind(): void {
  const toggleLightnessFields = document.querySelectorAll("[data-action~='toggle-lightness-on-change']")
  toggleLightnessFields.forEach(element => element.removeAndAddEventListener("change", toggleLightness))
}

/** Determines the lightness of an image in a file input, and sets a checkbox based off of that value. */
function toggleLightness(event: Event): void {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const reader = new FileReader()

  reader.onload = (event) => {
    const image = new Image()
    image.src = event.target!.result as string

    image.onload = () => {
      const lightness = getImageLightness(image)

      const targetInput = document.querySelector<HTMLInputElement>(`[data-lightness-toggle~="${input.dataset.target}"]`)

      if (targetInput) targetInput.checked = lightness < 0.5
    }
  }

  reader.readAsDataURL(input.files[0])
}

/** Determine the overall lightness of the given image. Returns a normalized value between 0 and 1; 0 is totally black, 1 is totally white. */
function getImageLightness(image: HTMLImageElement): number {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) return 0

  canvas.width = image.width
  canvas.height = image.height
  ctx.drawImage(image, 0, 0, image.width, image.height)

  const imageData = ctx.getImageData(0, 0, image.width, image.height).data
  let totalLightness = 0
  let pixelCount = 0

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i]
    const g = imageData[i + 1]
    const b = imageData[i + 2]

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const lightness = (max + min) / 2

    totalLightness += lightness
    pixelCount++
  }

  return (1 / 255) * (totalLightness / pixelCount)
}

import Siema from "siema/dist/siema.min"

export let carousel

export function render() {
  const blurElement = document.querySelector("[data-use-blur='true']")
  if (blurElement && blurElement.dataset.role != "carousel") setBlurColor(blurElement)

  const element = document.querySelector("[data-role='carousel']")

  if (!element) return

  setCarousel(element)

  const navigationElements = document.querySelectorAll("[data-action='carousel-go-to']")
  navigationElements.forEach((element) => element.removeAndAddEventListener("click", carouselGoTo))
}

export function setCarousel(element) {
  carousel = new Siema({
    selector: element,
    onInit: setActiveItem,
    onChange: setActiveItem,
    duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200
  })

  setResizeHandler()
}

function carouselGoTo() {
  const target = this.dataset.target

  carousel.goTo(target)
}

async function setActiveItem() {
  await new Promise(res => setTimeout(res)) // Wait(0) for carousel to be initiated

  if (carousel?.selector?.dataset.useBlur == "true") carousel.selector.dataset.setBlur = false

  const navigationElements = document.querySelectorAll("[data-action='carousel-go-to']")
  const activeElement = document.querySelector(".carousel__navigation-item--is-active")

  if (activeElement) activeElement.classList.remove("carousel__navigation-item--is-active")
  if (navigationElements.length) navigationElements[this.currentSlide].classList.add("carousel__navigation-item--is-active")

  setLazyImage(this)

  stopVideo()

  if (carousel?.selector?.dataset.useBlur) setBlurColor(carousel.innerElements[carousel.currentSlide])
}

function setLazyImage(element) {
  const slides = []
  slides.push(element.innerElements[element.currentSlide - 1])
  slides.push(element.innerElements[element.currentSlide])
  slides.push(element.innerElements[element.currentSlide + 1])

  slides.forEach(slide => {
    if (!slide) return

    const sources = slide.querySelectorAll("source, img")

    sources.forEach(source => {
      if (source.dataset.src) {
        source.src = source.dataset.src
      } else if (source.dataset.srcset) {
        source.srcset = source.dataset.srcset
      }
    })
  })
}

function stopVideo() {
  const carousel = document.querySelector("[data-role='carousel']")
  const iframe = carousel.querySelector("iframe")

  if (!iframe) return

  iframe.contentWindow.postMessage("{\"event\":\"command\",\"func\":\"pauseVideo\",\"args\":\"\"}", "*")
}

async function setBlurColor(element) {
  const image = element.querySelector("img")

  if (carousel && carousel.selector.dataset.setBlur == "true") return
  if (carousel) carousel.selector.dataset.setBlur = true

  let [r, g, b] = image ? await getAverageColor(image) : [100, 100, 100]

  if (r < 100 && g < 100 && b < 100) {
    r *= 2.5
    g *= 2.5
    b *= 2.5
  }

  const blurElement = document.querySelector("[data-role='carousel-blur']")
  blurElement.style.background = `rgb(${ r }, ${ g }, ${ b })`
}

async function getAverageColor(image) {
  // https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
  return new Promise(resolve => {
    const context = document.createElement("canvas").getContext("2d")
    context.imageSmoothingEnabled = true

    image.crossOrigin = "anonymous"

    image.onload = () => {
      // Draw image as 1x1 representation, averaging all colors
      context.drawImage(image, 0, 0, 1, 1)

      try {
        // This doesn't work locally on FireFox, but it does work on prod
        const imageData = context.getImageData(0, 0, 1, 1)

        // First 3 values are R G B
        resolve(imageData.data.slice(0, 3))
      } catch {
        // Ignore
      }
    }
  })
}

function setResizeHandler() {
  // Normally videos can't fullscreened because Siema resizeHandler fires when
  // you go into fullscreen. This fixes that by checking if the page is in
  // fullscreen before firing resizeHandler.
  window.removeEventListener("resize", carousel.resizeHandler)
  window.removeEventListener("resize", resizeHandler)
  window.addEventListener("resize", resizeHandler)
}

function resizeHandler() {
  if (!document.fullscreenElement) carousel.resizeHandler()
}

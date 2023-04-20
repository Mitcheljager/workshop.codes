import Siema from "siema/dist/siema.min"

export let carousel

export function render() {
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
}

function carouselGoTo() {
  const target = this.dataset.target

  carousel.goTo(target)
}

async function setActiveItem() {
  const navigationElements = document.querySelectorAll("[data-action='carousel-go-to']")
  const activeElement = document.querySelector(".carousel__navigation-item--is-active")

  if (activeElement) activeElement.classList.remove("carousel__navigation-item--is-active")
  if (navigationElements.length) navigationElements[this.currentSlide].classList.add("carousel__navigation-item--is-active")

  setLazyImage(this)

  stopVideo()

  await new Promise(res => setTimeout(res)) // Wait(0) for carousel to be initiated

  if (carousel?.selector?.dataset.useBlur) setBlurColor(this)
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

async function setBlurColor() {
  const activeElement = carousel.innerElements[carousel.currentSlide]
  const image = activeElement.querySelector("img")

  const [r, g, b] = await getAverageColor(image.src)

  const blurElement = document.querySelector("[data-role='carousel-blur']")
  blurElement.style.background = `rgb(${ r }, ${ g }, ${ b })`
}

async function getAverageColor(src) {
  // https://stackoverflow.com/questions/2541481/get-average-color-of-image-via-javascript
  return new Promise(resolve => {
    const context = document.createElement("canvas").getContext("2d")
    context.imageSmoothingEnabled = true

    const image = new Image

    image.src = src
    image.crossOrigin = "anonymous"

    image.onload = () => {
      context.drawImage(image, 0, 0, 1, 1)

      try {
        // This doesn't work locally on FireFox, but it does work on prod
        resolve(context.getImageData(0, 0, 1, 1).data.slice(0, 3))
      } catch {
        // Ignore
      }
    }
  })
}

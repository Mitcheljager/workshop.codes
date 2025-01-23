import Siema, { type SiemaOptions } from "siema"

interface SiemaExtended extends Siema {
  innerElements: HTMLElement[],
  resizeHandler: EventListener
}

export let carousel: SiemaExtended

export function render(): void {
  const blurElement = document.querySelector("[data-use-blur='true']") as HTMLElement
  if (blurElement && blurElement.dataset.role != "carousel") setBlur(blurElement)

  const element = document.querySelector("[data-role='carousel']") as HTMLElement

  if (!element) return

  setCarousel(element)

  const navigationElements = document.querySelectorAll("[data-action='carousel-go-to']")
  navigationElements.forEach((element) => element.removeAndAddEventListener("click", carouselGoTo))
}

export function setCarousel(element: HTMLElement): void {
  carousel = new Siema({
    selector: element,
    onInit: setActiveItem,
    onChange: setActiveItem,
    duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200
  }) as SiemaExtended

  setResizeHandler()
}

function carouselGoTo({ currentTarget }: { currentTarget: HTMLElement }): void {
  const target = parseInt(currentTarget.dataset.target || "0")
  carousel.goTo(target)
}

async function setActiveItem(this: SiemaExtended & SiemaOptions): Promise<void> {
  await new Promise(res => setTimeout(res)) // Wait(0) for carousel to be initiated

  const navigationElements = document.querySelectorAll("[data-action='carousel-go-to']")
  const activeElement = document.querySelector(".carousel__navigation-item--is-active")

  if (activeElement) {
    activeElement.classList.remove("carousel__navigation-item--is-active")
    activeElement.ariaSelected = null
  }

  if (navigationElements.length) {
    navigationElements[this.currentSlide].classList.add("carousel__navigation-item--is-active")
    navigationElements[this.currentSlide].ariaSelected = "true"
  }

  setLazyImage(this)

  stopVideo()

  const selector = this.selector as HTMLElement
  if (selector.dataset.useBlur) setBlur(carousel.innerElements[carousel.currentSlide])
}

function setLazyImage(carousel: SiemaExtended): void {
  const slides = []
  slides.push(carousel.innerElements[carousel.currentSlide - 1])
  slides.push(carousel.innerElements[carousel.currentSlide])
  slides.push(carousel.innerElements[carousel.currentSlide + 1])

  slides.forEach(slide => {
    if (!slide) return

    const images = slide.querySelectorAll("img")

    images.forEach(image => {
      if (image.dataset.src) image.src = image.dataset.src
      if (image.dataset.srcset) image.srcset = image.dataset.srcset
    })
  })
}

function stopVideo(): void {
  const carousel = document.querySelector("[data-role='carousel']")
  const iframe = carousel!.querySelector("iframe")

  if (!iframe?.contentWindow) return

  iframe.contentWindow.postMessage("{\"event\":\"command\",\"func\":\"pauseVideo\",\"args\":\"\"}", "*")
}

async function setBlur(element: HTMLElement): Promise<void> {
  const image = element.querySelector("img")
  const blurElements = Array.from(document.querySelectorAll("[data-role='carousel-blur']")) as HTMLImageElement[]
  const blurElement = blurElements[blurElements.length - 1]

  const newElement = new Image()
  if (blurElement.classList.contains("background-blur--visible")) {
    copyImageSources(newElement, image)

    newElement.dataset.role = "carousel-blur"
    newElement.classList.add("background-blur")

    blurElement.insertAdjacentElement("afterend", newElement)

    await new Promise(res => setTimeout(res, 1)) // Await one tick before fading

    newElement.classList.add("background-blur--visible")
    blurElement.classList.remove("background-blur--visible")

    await new Promise(res => setTimeout(res, 1200)) // Await transition
    blurElement.remove()
  } else {
    copyImageSources(blurElement, image)

    await new Promise(res => setTimeout(res, 1)) // Await one tick before fading
    blurElement.classList.add("background-blur--visible")
  }
}

function setResizeHandler(): void {
  // Normally videos can't fullscreened because Siema resizeHandler fires when
  // you go into fullscreen. This fixes that by checking if the page is in
  // fullscreen before firing resizeHandler.
  window.removeEventListener("resize", carousel.resizeHandler)
  window.removeEventListener("resize", resizeHandler)
  window.addEventListener("resize", resizeHandler)
}

function resizeHandler(event: Event): void {
  if (!document.fullscreenElement) carousel.resizeHandler(event)
}

function copyImageSources(newElement: HTMLImageElement, originalElement: HTMLImageElement | null): void {
  const fallbackPixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NobW39DwAFsQKP8FV1WwAAAABJRU5ErkJggg=="

  if (originalElement) {
    newElement.srcset = originalElement.srcset || fallbackPixel
    newElement.sizes = originalElement.sizes
  }

  newElement.src = originalElement?.src || fallbackPixel
}

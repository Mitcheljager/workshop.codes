import Siema, { type SiemaOptions } from "siema"

interface SiemaExtended extends Siema {
  innerElements: HTMLElement[],
  resizeHandler: EventListener
}

export let carousel: SiemaExtended

export function render() {
  const blurElement = document.querySelector("[data-use-blur='true']") as HTMLElement
  if (blurElement && blurElement.dataset.role != "carousel") setBlur(blurElement)

  const element = document.querySelector("[data-role='carousel']") as HTMLElement

  if (!element) return

  setCarousel(element)

  const navigationElements = document.querySelectorAll("[data-action='carousel-go-to']")
  navigationElements.forEach((element) => element.removeAndAddEventListener("click", carouselGoTo))
}

export function setCarousel(element: HTMLElement) {
  carousel = new Siema({
    selector: element,
    onInit: setActiveItem,
    onChange: setActiveItem,
    duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200
  }) as SiemaExtended

  setResizeHandler()
}

function carouselGoTo({ currentTarget }: { currentTarget: HTMLElement }) {
  const target = parseInt(currentTarget.dataset.target || '0')
  carousel.goTo(target)
}

async function setActiveItem(this: SiemaExtended & SiemaOptions) {
  await new Promise(res => setTimeout(res)) // Wait(0) for carousel to be initiated

  const navigationElements = document.querySelectorAll("[data-action='carousel-go-to']")
  const activeElement = document.querySelector(".carousel__navigation-item--is-active")

  if (activeElement) activeElement.classList.remove("carousel__navigation-item--is-active")
  if (navigationElements.length) navigationElements[this.currentSlide].classList.add("carousel__navigation-item--is-active")

  setLazyImage(this)

  stopVideo()

  const selector = this.selector as HTMLElement
  if (selector.dataset.useBlur) setBlur(carousel.innerElements[carousel.currentSlide])
}

function setLazyImage(carousel: SiemaExtended) {
  const slides = []
  slides.push(carousel.innerElements[carousel.currentSlide - 1])
  slides.push(carousel.innerElements[carousel.currentSlide])
  slides.push(carousel.innerElements[carousel.currentSlide + 1])

  slides.forEach(slide => {
    if (!slide) return

    const sources = Array.from(slide.querySelectorAll("source, img")) as HTMLImageElement[]

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
  const iframe = carousel!.querySelector("iframe")

  if (!iframe?.contentWindow) return

  iframe.contentWindow.postMessage("{\"event\":\"command\",\"func\":\"pauseVideo\",\"args\":\"\"}", "*")
}

async function setBlur(element: HTMLElement) {
  const image = element.querySelector("img")
  const blurElements = Array.from(document.querySelectorAll("[data-role='carousel-blur']")) as HTMLImageElement[]
  const blurElement = blurElements[blurElements.length - 1]
  const whitePixel = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NobW39DwAFsQKP8FV1WwAAAABJRU5ErkJggg=="

  const newElement = new Image()
  if (blurElement.classList.contains("background-blur--visible")) {
    newElement.src = image?.src || whitePixel
    newElement.dataset.role = "carousel-blur"
    newElement.classList.add("background-blur")

    blurElement.insertAdjacentElement("afterend", newElement)

    await new Promise(res => setTimeout(res, 1)) // Await one tick before fading

    newElement.classList.add("background-blur--visible")
    blurElement.classList.remove("background-blur--visible")

    await new Promise(res => setTimeout(res, 1200)) // Await transition
    blurElement.remove()
  } else {
    blurElement.src = image?.src || whitePixel
    await new Promise(res => setTimeout(res, 1)) // Await one tick before fading
    blurElement.classList.add("background-blur--visible")
  }
}

function setResizeHandler() {
  // Normally videos can't fullscreened because Siema resizeHandler fires when
  // you go into fullscreen. This fixes that by checking if the page is in
  // fullscreen before firing resizeHandler.
  window.removeEventListener("resize", carousel.resizeHandler)
  window.removeEventListener("resize", resizeHandler)
  window.addEventListener("resize", resizeHandler)
}

function resizeHandler(event: Event) {
  if (!document.fullscreenElement) carousel.resizeHandler(event)
}

import Siema, { type SiemaOptions } from "siema"

let carouselCards: Siema[] = []

export function destroy(): void {
  if (carouselCards.length == 0) return

  const elements = document.querySelectorAll("[data-role='carousel-cards']")

  elements.forEach(element => { element.classList.remove("initialised") })
  carouselCards.forEach(carousel => carousel.destroy(true))

  carouselCards = []
}

export function render(): void {
  const elements = Array.from(document.querySelectorAll("[data-role='carousel-cards']")) as HTMLElement[]

  if (elements.length == 0) return

  elements.forEach(element => {
    carouselCards = [...carouselCards, new Siema({
      selector: element,
      onInit: (() => element.classList.add("initialised")),
      onChange: carouselCardsChanged,
      perPage: { 450: 2, 768: 3 },
      duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 200
    })]

    element.dataset.carouselId = (carouselCards.length - 1).toString()
  })

  const previousElements = document.querySelectorAll("[data-action='carousel-previous']")
  previousElements.forEach((element) => element.removeAndAddEventListener("click", carouselPrevious))

  const nextElements = document.querySelectorAll("[data-action='carousel-next']")
  nextElements.forEach((element) => element.removeAndAddEventListener("click", carouselNext))
}

function carouselCardsChanged(this: Siema & SiemaOptions): void {
  const selector = this.selector as HTMLElement
  const parent = selector.closest(".card-carousel")
  const nextElement = parent!.querySelector("[data-action='carousel-next']") as HTMLButtonElement
  const previousElement = parent!.querySelector("[data-action='carousel-previous']") as HTMLButtonElement

  const atStart = this.currentSlide == 0
  previousElement!.classList.toggle("card-carousel__control--disabled", atStart)
  previousElement!.disabled = atStart

  const atEnd = this.currentSlide + this.perPage >= parseInt(selector?.dataset?.max || "")
  nextElement!.classList.toggle("card-carousel__control--disabled", atEnd)
  nextElement!.disabled = atEnd
}

function carouselNext({ currentTarget }: { currentTarget: HTMLElement }): void {
  const carouselId = getCarouselId(currentTarget)
  carouselCards[carouselId].next()
}

function carouselPrevious({ currentTarget }: { currentTarget: HTMLElement }): void {
  const carouselId = getCarouselId(currentTarget)
  carouselCards[carouselId].prev()
}

function getCarouselId(element: HTMLElement): number {
  const carouselElement = element.closest(".card-carousel")?.querySelector("[data-role='carousel-cards']") as HTMLElement
  return parseInt(carouselElement.dataset.carouselId || "0")
}

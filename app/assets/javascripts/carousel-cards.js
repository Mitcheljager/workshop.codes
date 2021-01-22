//= require "siema/dist/siema.min"

let carouselCards;

document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role='carousel-cards']")

  if (!element) return

  carouselCards = new Siema({
    selector: element,
    onInit: (() => element.classList.add("initialised")),
    onChange: carouselCardsChanged,
    perPage: { 400: 2, 768: 3 }
  })

  const previousElements = document.querySelectorAll("[data-action='carousel-previous']")
  previousElements.forEach((element) => element.removeEventListener("click", carouselPrevious))
  previousElements.forEach((element) => element.addEventListener("click", carouselPrevious))

  const nextElements = document.querySelectorAll("[data-action='carousel-next']")
  nextElements.forEach((element) => element.removeEventListener("click", carouselNext))
  nextElements.forEach((element) => element.addEventListener("click", carouselNext))
})

function carouselCardsChanged() {
  const nextElement = document.querySelector("[data-action='carousel-next']")
  const previousElement = document.querySelector("[data-action='carousel-previous']")

  previousElement.classList.toggle("card-carousel__control--disabled", this.currentSlide == 0)
  nextElement.classList.toggle("card-carousel__control--disabled", this.currentSlide + this.perPage >= parseInt(this.selector.dataset.max))
}

function carouselNext() {
  carouselCards.next()
}

function carouselPrevious() {
  carouselCards.prev()
}

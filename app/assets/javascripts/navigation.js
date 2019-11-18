document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll("[data-action='toggle-navigation']")

  elements.forEach((element) => element.addEventListener("click", toggleNavigation))
})

function toggleNavigation(event) {
  event.preventDefault()

  const navigationElement = document.querySelector("[data-role='navigation']")

  navigationElement.classList.toggle("header__content--is-active")
}

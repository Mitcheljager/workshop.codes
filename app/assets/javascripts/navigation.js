document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='toggle-navigation']")

  elements.forEach((element) => element.removeEventListener("click", toggleNavigation))
  elements.forEach((element) => element.addEventListener("click", toggleNavigation))

  const searchElement = document.querySelector("[data-action='toggle-search']")
  searchElement.removeEventListener("click", toggleSearch)
  searchElement.addEventListener("click", toggleSearch)
})

function toggleNavigation(event) {
  event.preventDefault()

  const navigationElement = document.querySelector("[data-role='navigation']")
  navigationElement.classList.toggle("header__content--is-active")
}

function toggleSearch(event) {
  event.preventDefault()

  const navigationElement = document.querySelector("[data-role='search']")
  navigationElement.classList.toggle("header__search--is-active")

  navigationElement.querySelector("input[name='query']").focus()
}

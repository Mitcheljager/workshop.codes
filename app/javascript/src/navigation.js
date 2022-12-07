export function bind() {
  const elements = document.querySelectorAll("[data-action='toggle-navigation']")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleNavigation))

  const searchElement = document.querySelector("[data-action='toggle-search']")
  searchElement.removeAndAddEventListener("click", toggleSearch)
}

function toggleNavigation(event) {
  event.preventDefault()

  const navigationElement = document.querySelector("[data-role='navigation']")
  navigationElement.classList.toggle("header__content--is-active")
}

function toggleSearch(event) {
  event.preventDefault()

  const searchElement = document.querySelector("[data-role~='search-popout']")
  searchElement.classList.toggle("header__search--is-active")

  searchElement.querySelector("input[name='query']").focus()
}

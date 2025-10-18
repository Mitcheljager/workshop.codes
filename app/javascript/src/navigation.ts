export function bind(): void {
  const elements = document.querySelectorAll("[data-action='toggle-navigation']")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleNavigation))

  const searchElement = document.querySelector("[data-action='toggle-search']")
  if (searchElement) searchElement.removeAndAddEventListener("click", toggleSearch)
}

function toggleNavigation(event: Event): void {
  event.preventDefault()

  const navigationElement = document.querySelector("[data-role='navigation']")
  navigationElement?.classList.toggle("header__content--is-active")
}

function toggleSearch(event: Event): void {
  event.preventDefault()

  const searchElement = document.querySelector("[data-role~='search-popout']")
  searchElement?.classList.toggle("header__search--is-active")

  const inputElement = searchElement?.querySelector<HTMLFormElement>("input[name='query']")

  inputElement?.focus()
}

export function closeNavigation(): void {
  const navigationElement = document.querySelector("[data-role='navigation']")
  navigationElement?.classList.remove("header__content--is-active")
}

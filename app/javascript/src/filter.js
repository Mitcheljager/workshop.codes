export function bind() {
  const elements = document.querySelectorAll("[data-action='add-filter']")
  elements.forEach((element) => element.removeAndAddEventListener("click", addFilter))

  const linkElements = document.querySelectorAll("[data-role='filter-link']")
  linkElements.forEach((element) => element.removeAndAddEventListener("click", buildFilterPath))
}

export function addFilter(event) {
  event.preventDefault()

  const filterToggle = this.closest("[data-filter]")
  const filterElement = filterToggle.querySelector("[data-filter-type]")
  const defaultValue = filterToggle.dataset.default

  filterToggle.classList.toggle("filter__item--active", this.dataset.value != "")
  filterElement.dataset.value = this.dataset.value
  filterElement.innerText = this.dataset.value == "" ? defaultValue : this.innerText
}

function buildFilterPath(event) {
  event.preventDefault()

  const parent = event.target.closest("[data-role~='search']")
  event.target.innerHTML = "<div class='spinner spinner--small'></div>"

  let buildPath = {
    "category": filterValue("categories", parent),
    "hero": filterValue("heroes", parent),
    "map": filterValue("maps", parent),
    "from": filterValue("from", parent),
    "to": filterValue("to", parent),
    "author": filterValue("author", parent),
    "players": filterValue("players", parent),
    "search": encodeURIComponent(parent.querySelector("input[name='query']").value),
    "sort": filterValue("sort", parent),
    "language": filterValue("language", parent)
  }

  buildPath = Object.fromEntries(Object.entries(buildPath).filter(([k, v]) => v != ""))
  buildPath = Object.entries(buildPath).map(([k, v]) => `${ k }=${ v }`).join("&")
  const currentLocale = document.querySelector("[data-filter-locale]").dataset.filterLocale

  window.location = `/${ currentLocale == "en" ? "" : currentLocale + "/" }search?${ buildPath }`
}

function filterValue(type, parent) {
  const element = parent.querySelector(`[data-filter-type='${ type }']`)
  const value = element ? (element.dataset.value || "") : ""

  return value
}

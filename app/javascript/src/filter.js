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

  const linkElement = document.querySelector("[data-role='filter-link']")
  linkElement.innerHTML = "<div class='spinner spinner--small'></div>"

  let buildPath = {
    "category": filterValue("categories"),
    "hero": filterValue("heroes"),
    "map": filterValue("maps"),
    "from": filterValue("from"),
    "to": filterValue("to"),
    "expired": document.querySelector("[data-filter-type='exclude-expired']").checked ? "true" : "",
    "overwatch_2": document.querySelector("[data-filter-type='overwatch-2']").checked ? "true" : "",
    "author": filterValue("author"),
    "players": filterValue("players"),
    "query": document.querySelector("input[name='query']").value,
    "sort": filterValue("sort"),
    "language": filterValue("language")
  }

  buildPath = Object.fromEntries(Object.entries(buildPath).filter(([k, v]) => v != ""))
  buildPath = Object.entries(buildPath).map(([k, v]) => `${ k }=${ v }`).join("&")
  const currentLocale = document.querySelector("[data-filter-locale]").dataset.filterLocale

  window.location = `/${ currentLocale == "en" ? "" : currentLocale + "/" }search?${ buildPath }`
}

function filterValue(type) {
  const element = document.querySelector(`[data-filter-type='${ type }']`)
  const value = element ? (element.dataset.value || "") : ""

  return value
}

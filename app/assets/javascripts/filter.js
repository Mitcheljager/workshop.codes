document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='add-filter']")

  elements.forEach((element) => element.removeEventListener("mousedown", addFilter))
  elements.forEach((element) => element.addEventListener("mousedown", addFilter))
})

function addFilter() {
  event.preventDefault()
}

function buildFilterPath() {
  const linkElement = document.querySelector("[data-role='filter-link']")

  const buildPath = {
    "categories": filterValue("categories"),
    "heroes": filterValue("heroes"),
    "maps": filterValue("maps"),
    "from": filterValue("from"),
    "to": filterValue("to"),
    "exclude-expired": filterValue("exclude-expired"),
    "author": filterValue("author"),
    "search": filterValue("search"),
    "sort": filterValue("sort"),
  }
}

function filterValue(type) {
  const element = document.querySelector(`[data-filter='${ type }']`)
  const value = element ? element.dataset.value : ""

  return value
}

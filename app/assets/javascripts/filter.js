document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='add-filter']")
  elements.forEach((element) => element.removeEventListener("click", addFilter))
  elements.forEach((element) => element.addEventListener("click", addFilter))

  const linkElement = document.querySelector("[data-role='filter-link']")
  linkElement.removeEventListener("click", buildFilterPath)
  linkElement.addEventListener("click", buildFilterPath)
})

function addFilter(event) {
  event.preventDefault()

  const filterElement = this.closest("[data-filter]").querySelector("[data-filter-type]")
  filterElement.dataset.value = this.dataset.value
  filterElement.innerText = this.dataset.value == "" ? "Select..." : this.innerText

  closeDropdown()
}

function buildFilterPath(event) {
  event.preventDefault()

  const linkElement = document.querySelector("[data-role='filter-link']")
  linkElement.innerHTML = "<div class='spinner spinner--small'></div>"

  let buildPath = {
    "categories": filterValue("categories"),
    "heroes": filterValue("heroes"),
    "maps": filterValue("maps"),
    "from": filterValue("from"),
    "to": filterValue("to"),
    "exclude-expired": document.querySelector("[data-filter-type='exclude-expired']").checked ? "true" : "",
    "author": filterValue("author"),
    "search": document.querySelector("input[name='query']").value,
    "sort": filterValue("sort"),
  }

  buildPath = Object.fromEntries(Object.entries(buildPath).filter(([k, v]) => v != ""))
  buildPath = Object.entries(buildPath).map(([k, v]) => `${ k }/${ v }`).join("/")

  window.location = "/" + buildPath
}

function filterValue(type) {
  const element = document.querySelector(`[data-filter-type='${ type }']`)
  const value = element ? (element.dataset.value || "") : ""

  return value
}

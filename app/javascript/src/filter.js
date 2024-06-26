import FetchRails from "@src/fetch-rails"
import { render as renderNumPlayersSlider } from "@src/num-players-slider"
import { bind as bindGetVerifiedUsers } from "@src/get-verified-users"
import { closeDropdown } from "@src/dropdown"

export function bind() {
  const elements = document.querySelectorAll("[data-action~='get-filter-content']")
  elements.forEach(element => element.removeAndAddEventListener("click", getPartial))
}

function getPartial(event) {
  const target = event.target.dataset.url ? event.target : event.target.closest("[data-url]")
  const url = target.dataset.url

  if (target.dataset.loaded == "true") return
  target.dataset.loaded = true

  new FetchRails(url).get().then(data => {
    const element = event.target.closest("[data-toggle-content").querySelector("[data-partial]")

    element.innerHTML = data
  }).then(() => bindFilterContent())
}

function bindFilterContent() {
  const elements = document.querySelectorAll("[data-action='add-filter']")
  elements.forEach((element) => element.removeAndAddEventListener("click", addFilter))

  const linkElements = document.querySelectorAll("[data-role='filter-link']")
  linkElements.forEach((element) => element.removeAndAddEventListener("click", buildFilterPath))

  bindGetVerifiedUsers()
  renderNumPlayersSlider()
}

function addFilter(event) {
  event.preventDefault()

  const filterToggle = event.target.closest("[data-filter]")
  const filterElement = filterToggle.querySelector("[data-filter-type]")
  const defaultValue = filterToggle.dataset.default

  filterToggle.classList.toggle("filter__item--active", event.target.dataset.value != "")
  filterElement.dataset.value = event.target.dataset.value
  filterElement.innerText = event.target.dataset.value == "" ? defaultValue : event.target.innerText

  closeDropdown(event, true)
}

function buildFilterPath(event) {
  const parent = event.target.closest("[data-role~='search']")
  event.target.innerHTML = "<div class='spinner spinner--small'></div>"

  let buildPath = {
    "category": filterValue("categories", parent),
    "hero": filterValue("heroes", parent),
    "map": filterValue("maps", parent),
    "author": filterValue("author", parent),
    "players": filterValue("players", parent),
    "search": encodeURIComponent(parent.querySelector("input[name='query']").value),
    "sort": filterValue("sort", parent)
  }

  buildPath = Object.fromEntries(Object.entries(buildPath).filter(([_, v]) => v != ""))
  buildPath = Object.entries(buildPath).map(([k, v]) => `${k}=${v}`).join("&")

  window.location = `/search?${buildPath}`
}

function filterValue(type, parent) {
  const element = parent.querySelector(`[data-filter-type='${type}']`)
  const value = element ? (element.dataset.value || "") : ""

  return value
}

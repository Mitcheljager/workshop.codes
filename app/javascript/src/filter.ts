import FetchRails from "@src/fetch-rails"
import { render as renderNumPlayersSlider } from "@src/num-players-slider"
import { bind as bindGetVerifiedUsers } from "@src/get-verified-users"
import { closeDropdown } from "@src/dropdown"

export function bind(): void {
  const elements = document.querySelectorAll("[data-action~='get-filter-content']")
  elements.forEach(element => element.removeAndAddEventListener("click", getPartial))
}

function getPartial({ target }: { target: HTMLElement }): void {
  const targetElement = target.dataset.url ? target : target.closest<HTMLElement>("[data-url]")
  const url = targetElement?.dataset.url

  if (!targetElement || !url) return
  if (targetElement.dataset.loaded == "true") return

  targetElement.dataset.loaded = "true"

  new FetchRails(url).get().then(data => {
    const element = target.closest("[data-toggle-content")?.querySelector("[data-partial]")

    if (element) element.innerHTML = data as string
  }).then(() => bindFilterContent())
}

function bindFilterContent(): void {
  const elements = document.querySelectorAll("[data-action='add-filter']")
  elements.forEach((element) => element.removeAndAddEventListener("click", addFilter))

  const linkElements = document.querySelectorAll("[data-role='filter-link']")
  linkElements.forEach((element) => element.removeAndAddEventListener("click", buildFilterPath))

  bindGetVerifiedUsers()
  renderNumPlayersSlider()
}

function addFilter(event: Event): void {
  event.preventDefault()

  const target = event.target as HTMLElement
  const filterToggle = target.closest<HTMLElement>("[data-filter]")!
  const filterElement = filterToggle.querySelector<HTMLElement>("[data-filter-type]")!
  const defaultValue = filterToggle.dataset.default || ""

  filterToggle.classList.toggle("filter__item--active", target.dataset.value != "")
  filterElement.dataset.value = target.dataset.value
  filterElement.innerText = target.dataset.value == "" ? defaultValue : target.innerText

  closeDropdown(event, true)
}

function buildFilterPath({ target }: { target: HTMLElement }): void {
  const parent = target.closest<HTMLElement>("[data-role~='search']")

  if (!parent) return

  target.innerHTML = "<div class='spinner spinner--small'></div>"

  const buildPath = {
    "category": filterValue("categories", parent),
    "hero": filterValue("heroes", parent),
    "map": filterValue("maps", parent),
    "author": filterValue("author", parent),
    "players": filterValue("players", parent),
    "sort": filterValue("sort", parent),
    "search": encodeURIComponent(parent?.querySelector<HTMLFormElement>("input[name='query']")?.value)
  }

  const filteredBuildPath = Object.fromEntries(Object.entries(buildPath).filter(([_, v]) => v != ""))
  const buildPathString = Object.entries(filteredBuildPath).map(([k, v]) => `${k}=${v}`).join("&")

  window.location.href = `/search?${buildPathString}`
}

function filterValue(type: string, parent: HTMLElement): string {
  const element = parent.querySelector(`[data-filter-type='${type}']`) as HTMLElement
  const value = element ? (element.dataset.value || "") : ""

  return value
}

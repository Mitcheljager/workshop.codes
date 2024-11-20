import debounce from "@src/debounce"
import FetchRails from "@src/fetch-rails"

export function bind() {
  const element = document.querySelector("[data-role='wiki-search']")

  if (!element) return

  element.removeEventListener("input", searchWiki)
  element.addEventListener("input", searchWiki)
}

const searchWiki = debounce(() => {
  const element = document.querySelector("[data-role='wiki-search']")
  if (!element.value) return

  const resultsElement = document.querySelector("[data-role='wiki-search-results']")

  resultsElement.innerHTML = "Searching..."
  resultsElement.classList.add("search__results--empty")
  const url = resultsElement.dataset.url.replace("query", element.value) + ".json"

  new FetchRails(url).get()
    .then(data => {
      setWikiSearchResults(JSON.parse(data))
    })
}, 250)

function setWikiSearchResults(data) {
  const resultsElement = document.querySelector("[data-role='wiki-search-results']")

  if (!data.length) {
    resultsElement.innerHTML = "No results found"
    return
  }

  resultsElement.classList.remove("search__results--empty")
  resultsElement.innerHTML = ""

  data.forEach(item => {
    const itemElement = document.createElement("a")
    itemElement.classList.add("search__item")
    itemElement.innerText = item.title
    itemElement.href = `/wiki/articles/${decodeURIComponent(item.slug)}`

    const categoryElement = document.createElement("span")
    categoryElement.classList.add("search__item-category")
    categoryElement.innerText = "in " + item.category.title

    itemElement.append(categoryElement)

    resultsElement.append(itemElement)
  })
}

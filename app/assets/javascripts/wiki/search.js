document.addEventListener("turbolinks:load", function() {
  const element = document.querySelector("[data-role='wiki-search']")

  if (!element) return

  element.removeEventListener("input", searchWiki)
  element.addEventListener("input", searchWiki)
})

const searchWiki = debounce((event) => {
  const element = document.querySelector("[data-role='wiki-search']")
  if (!element.value) return

  const resultsElement = document.querySelector("[data-role='wiki-search-results']")

  resultsElement.innerHTML = "Searching..."
  const url = resultsElement.dataset.url.replace("query", element.value) + ".json"

  fetch(url, {
    method: "get",
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    setWikiSearchResults(JSON.parse(data))
  })
}, 500)

function setWikiSearchResults(data) {
  const resultsElement = document.querySelector("[data-role='wiki-search-results']")
  resultsElement.innerHTML = ""

  data.forEach(item => {
    const itemElement = document.createElement("a")
    itemElement.classList.add("search__item")
    itemElement.innerText = item.title
    itemElement.href = `/wiki/articles/${ item.slug }`

    resultsElement.append(itemElement)
  })
}

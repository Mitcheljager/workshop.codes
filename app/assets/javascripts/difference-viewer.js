document.addEventListener("turbolinks:load", function() {
  document.removeEventListener("scroll", scrollAlong)

  const toggleUnchangedFilesElement = document.querySelector("[data-action='toggle-unchanged-difference']")

  if (!toggleUnchangedFilesElement) return

  toggleUnchangedFilesElement.removeAndAddEventListener("input", toggleUnchangedFiles)

  const elements = document.querySelectorAll(".diff li")
  elements.forEach(element => {
    element.classList.add("microlight")
  })

  document.addEventListener("scroll", scrollAlong)

  createRules()
  scrollAlong()
})

function toggleUnchangedFiles(event) {
  const element = document.querySelector(".diff")
  const state = this.checked

  element.classList.toggle("hide-unchanged", state)
}

function createRules() {
  const element = document.querySelector(".diff")

  if (!element) return

  const selectElement = document.querySelector("[data-action='jump-to-rule']")
  const items = element.querySelectorAll("li")

  selectElement.removeAndAddEventListener("input", goToRule)

  let array = []
  items.forEach((item, index) => {
    let content = item.textContent
    if (!content.match(/rule\("(.*)"\)/g)) return

    array.push([content.replace('rule("', "").replace('")', ""), index])
  })

  array.forEach(rule => {
    const item = document.createElement("option")

    item.innerHTML = rule[0]
    item.value = rule[1]

    selectElement.append(item)
  })
}

function goToRule(event) {
  const target = document.querySelector(`.diff li:nth-child(${ event.target.value })`)
  const differenceHeaderElement = document.querySelector("[data-role='difference-header']")

  const offset = target.getBoundingClientRect().top + window.scrollY - differenceHeaderElement.offsetHeight
  window.scroll(0, offset)
}

function scrollAlong(event) {
  const element = document.querySelector("[data-role='difference-header']")
  const elementOffset = element.getBoundingClientRect().top

  element.style.height = element.querySelector(".difference-header").offsetHeight + "px"
  element.querySelector(".difference-header").classList.toggle("difference-header--fixed", elementOffset < 1)
}

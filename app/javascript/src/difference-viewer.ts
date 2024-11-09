export function render() {
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
}

function toggleUnchangedFiles({ target }: { target: HTMLFormElement }) {
  const element = document.querySelector(".diff")
  const state = target.checked

  if (element) element.classList.toggle("hide-unchanged", state)
}

function createRules() {
  const element = document.querySelector(".diff")

  if (!element) return

  const selectElement = document.querySelector("[data-action='jump-to-rule']")
  const items = element.querySelectorAll("li")

  if (!selectElement) return

  selectElement.removeAndAddEventListener("input", goToRule)

  const array: (string | number)[][] = []
  items.forEach((item, index) => {
    const content = item.textContent || ''
    if (!content.match(/rule\("(.*)"\)/g)) return

    array.push([content.replace("rule(", "").replace(")", ""), index])
  })

  array.forEach(rule => {
    const item = document.createElement("option")

    item.innerHTML = rule[0].toString()
    item.value = rule[1].toString()

    selectElement.append(item)
  })
}

function goToRule({ target }: { target: HTMLFormElement }) {
  const destination = document.querySelector(`.diff li:nth-child(${target.value})`)
  const differenceHeaderElement = document.querySelector("[data-role='difference-header']") as HTMLElement

  if (!destination || !differenceHeaderElement) return

  const offset = destination.getBoundingClientRect().top + window.scrollY - differenceHeaderElement.offsetHeight
  window.scroll(0, offset)
}

function scrollAlong() {
  const element = document.querySelector("[data-role='difference-header']") as HTMLElement
  const headerElement = element?.querySelector(".difference-header") as HTMLElement
  const elementOffset = element?.getBoundingClientRect().top || 0

  if (!element || !headerElement) return

  element.style.height = headerElement.offsetHeight + "px"
  headerElement.classList.toggle("difference-header--fixed", elementOffset < 1)
}

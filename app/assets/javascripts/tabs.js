document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='set-tab']")

  elements.forEach((element) => element.removeAndAddEventListener("click", setTab))
})

function setTab(event) {
  event.preventDefault()

  const target = this.dataset.target
  const parentElement = this.closest("[data-role~='tabs']")

  const tabElement = this.classList.contains("tabs__item") ? this : document.querySelector(`.tabs__item[data-target~='${ target }']`)

  setActiveTab(tabElement, parentElement)
  revealTab(target, parentElement)
}

function revealTab(target, parentElement) {
  const targetElement = document.querySelector(`[data-tab~='${ target }']`)
  const activeElement = parentElement.querySelector(".tabs-content--active")

  activeElement.classList.add("tabs-content--transitioning-out")

  setTimeout(() => {
    activeElement.classList.remove("tabs-content--active")
    activeElement.classList.remove("tabs-content--transitioning-out")

    targetElement.classList.add("tabs-content--active")
    targetElement.classList.add("tabs-content--transitioning-in")
  }, 150)
}

function setActiveTab(targetElement, parentElement) {
  const tabs = parentElement.querySelectorAll(".tabs__item")

  tabs.forEach(tab => { tab.classList.remove("tabs__item--active") })
  targetElement.classList.add("tabs__item--active")
}

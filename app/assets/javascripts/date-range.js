document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='set-date-range']")

  elements.forEach((element) => element.removeEventListener("mousedown", setDateRange))
  elements.forEach((element) => element.addEventListener("mousedown", setDateRange))

  setLabels()
})

function setDateRange(event) {
  const element = this
  const startMouseX = event.pageX
  const parent = this.closest("[data-role='date-range']")
  const parentWidth = parent.offsetWidth
  const values = JSON.parse(parent.dataset.values)
  const stepSize = parent.dataset.max / (Object.keys(values).length - 1)

  let value = parseInt(element.dataset.currentValue || 0)
  let max = parent.dataset.max
  let min = 0
  if (this.dataset.target == "from") max = parseInt(parent.querySelector("[data-target='to']").dataset.currentValue) - stepSize
  if (this.dataset.target == "to") min = parseInt(parent.querySelector("[data-target='from']").dataset.currentValue) + stepSize

  function onMouseMove(event) {
    const currentMouseX = event.pageX
    const difference = currentMouseX - startMouseX

    value = Math.max(Math.min(parseInt(element.dataset.currentValue || 0) + difference, max), min)

    const step = Math.ceil(value / stepSize)
    value = step * stepSize
    element.style.transform = `translateX(${ value }px)`
    element.dataset.value = value

    setLabel(element, values, step)
    setActiveTrack(parent)
  }

  function endSetDateRange(event) {
    element.dataset.currentValue = value

    document.removeEventListener("mousemove", onMouseMove)
    document.removeEventListener("mouseup", endSetDateRange)
  }

  document.addEventListener("mousemove", onMouseMove)
  document.addEventListener("mouseup", endSetDateRange)
}

function setActiveTrack(element) {
  const activeElement = element.querySelector("[data-role='date-range-active']")
  const toElement = element.querySelector("[data-target='to']")
  const fromElement = element.querySelector("[data-target='from']")

  activeElement.style.width = toElement.dataset.value - fromElement.dataset.value + "px"
  activeElement.style.transform = `translateX(${ parseInt(fromElement.dataset.value || 0) }px)`
}

function setLabels() {
  const elements = document.querySelectorAll("[data-action='set-date-range']")

  elements.forEach(element => {
    const parent = element.closest("[data-role='date-range']")
    setLabel(element, JSON.parse(parent.dataset.values), parseInt(element.dataset.default))
  })
}

function setLabel(element, values, step) {
  const label = element.querySelector("[data-role='date-range-label']")
  label.innerHTML = Object.keys(values)[step]
}

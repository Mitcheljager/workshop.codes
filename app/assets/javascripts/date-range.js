document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='set-date-range']")

  if (!elements.length) return

  elements.forEach((element) => element.removeEventListener("mousedown", setDateRange))
  elements.forEach((element) => element.addEventListener("mousedown", setDateRange))

  setLabels()
  setInitialValues()
})

function setDateRange(event) {
  const element = this
  const startMouseX = event.pageX
  const parent = this.closest("[data-role='date-range']")
  const parentWidth = parent.offsetWidth
  const values = JSON.parse(parent.dataset.values)
  const stepSize = getStepSize(parent, values)

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
    element.dataset.dragValue = value
    element.dataset.step = step

    setLabel(element, values, step)
    setActiveTrack(parent)
  }

  function endSetDateRange(event) {
    element.dataset.currentValue = value
    element.dataset.value = Object.values(values)[element.dataset.step]

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

  activeElement.style.width = toElement.dataset.dragValue - fromElement.dataset.dragValue + "px"
  activeElement.style.transform = `translateX(${ parseInt(fromElement.dataset.dragValue || 0) }px)`
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

function getStepSize(parent, values) {
  return parent.dataset.max / (Object.keys(values).length - 1)
}

function setInitialValues() {
  const elements = [
    document.querySelector("[data-target='from']"),
    document.querySelector("[data-target='to']")
  ]

  elements.forEach(element => {
    if (element.dataset.value == "") return

    const parent = element.closest("[data-role='date-range']")
    const values = JSON.parse(parent.dataset.values)
    const index = Object.values(values).indexOf(element.dataset.value)
    const value = Object.fromEntries(Object.entries(values).filter(([k, v]) => v == element.dataset.value))

    const label = element.querySelector("[data-role='date-range-label']")
    label.innerText = Object.keys(value)[0]

    const stepSize = getStepSize(parent, values)
    const stepPosition = index * stepSize

    element.style.transform = `translateX(${ stepPosition }px)`
    element.dataset.dragValue = stepPosition
    element.dataset.currentValue = stepPosition

    setActiveTrack(parent)
  })
}

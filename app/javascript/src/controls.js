import Sortable from "sortablejs"

export function bind() {
  const element = document.querySelector("[data-role='controls-form']")

  if (!element) return

  const addElement = document.querySelector("[data-action='add-controls-item']")
  addElement.removeAndAddEventListener("click", addControlsElement)

  createControlsSortable()
  bindFormElements()
}

function bindFormElements() {
  const formElements = document.querySelectorAll("[data-role~='controls-item-input']")
  formElements.forEach(element => element.removeAndAddEventListener("change", createControlsArray))

  const selectElements = document.querySelectorAll("[data-role~='controls-item-select']")
  selectElements.forEach(element => element.removeAndAddEventListener("change", toggleCustom))

  const removeElements = document.querySelectorAll("[data-action~='controls-item-remove']")
  removeElements.forEach(element => element.removeAndAddEventListener("click", removeItem))
}

function addControlsElement(event) {
  event.preventDefault()

  const wrapper = document.querySelector("[data-role='controls-form']")
  const template = document.getElementById("controls-item").content.cloneNode(true)

  wrapper.append(template)
  bindFormElements()
}

function createControlsArray() {
  const controlItems = document.querySelectorAll("[data-role='controls-item']")

  const output = []

  controlItems.forEach(item => {
    const selectElements = item.querySelectorAll("select")
    const descriptionElement = item.querySelector("[name='controls-item-description']")

    let selectValues = [...selectElements].map(element => {
      if (element.value == "Custom") {
        const parentElement = element.closest("[data-role='select-with-custom']")
        const inputElement = parentElement.querySelector("input")

        return { "Custom": inputElement.value }
      }

      return element.value
    })
    selectValues = selectValues.filter(value => value != "")
    
    if (!selectValues || !descriptionElement.value) return

    output.push({ buttons: selectValues, description: descriptionElement.value })
  })

  const inputElement = document.querySelector("[name='post[controls]']")
  inputElement.value = JSON.stringify(output)
}

function toggleCustom() {
  const parentElement = this.closest("[data-role='select-with-custom']")
  const inputElement = parentElement.querySelector("input")

  inputElement.classList.toggle("hidden", this.value != "Custom")
}

function removeItem(event) {
  event.preventDefault()

  if (!confirm("Are you sure you want to remove this line?")) return

  const parentElement = this.closest("[data-role='controls-item']")
  parentElement.remove()

  createControlsArray()
}

function createControlsSortable() {
  const element = document.querySelector("[data-role='controls-form']")

  Sortable.create(element, {
    handle: "[data-role='controls-item-move-handle']",
    animation: 50,
    onUpdate: () => { createControlsArray() }
  })
}

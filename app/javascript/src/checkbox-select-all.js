export function bind() {
  const elements = document.querySelectorAll("[data-action='checkbox-select-all']")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleCheckboxes))
}

function toggleCheckboxes() {
  const parent = this.closest("[data-checkbox-group]")

  const checkboxes = parent.querySelectorAll("input[type='checkbox']")
  const state = this.checked

  checkboxes.forEach(checkbox => checkbox.checked = state)
}

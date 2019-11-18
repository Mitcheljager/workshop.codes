document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='checkbox-select-all']")

  elements.forEach((element) => element.removeEventListener("click", toggleCheckboxes))
  elements.forEach((element) => element.addEventListener("click", toggleCheckboxes))
})

function toggleCheckboxes(event) {
  const parent = this.closest("[data-checkbox-group]")

  const checkboxes = parent.querySelectorAll("input[type='checkbox']")
  const state = this.checked

  checkboxes.forEach(checkbox => checkbox.checked = state)
}

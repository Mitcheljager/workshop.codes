export function bind() {
  const elements = document.querySelectorAll("[data-action='checkbox-select-all']")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleCheckboxes))
}

function toggleCheckboxes({ currentTarget }: { currentTarget: HTMLFormElement }) {
  const parent = currentTarget.closest("[data-checkbox-group]")

  if (!parent) return

  const checkboxes = Array.from(parent.querySelectorAll("input[type='checkbox']")) as HTMLFormElement[]
  const state = currentTarget.checked

  checkboxes.forEach(checkbox => checkbox.checked = state)
}

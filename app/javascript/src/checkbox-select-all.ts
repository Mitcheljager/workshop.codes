export function bind(): void {
  const elements = document.querySelectorAll("[data-action='checkbox-select-all']")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleCheckboxes))
}

function toggleCheckboxes({ currentTarget }: { currentTarget: HTMLFormElement }): void {
  const parent = currentTarget.closest("[data-checkbox-group]")
  const checkboxes = Array.from(parent!.querySelectorAll<HTMLFormElement>("input[type='checkbox']"))
  const state = currentTarget.checked

  checkboxes.forEach(checkbox => checkbox.checked = state)
}

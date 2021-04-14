let dropdownOpen = false

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action~='toggle-dropdown']")
  const dropdowns = document.querySelectorAll("[data-dropdown]")

  elements.forEach((element) => element.removeAndAddEventListener("click", toggleDropdown))
  dropdowns.forEach((dropdown) => dropdown.removeAndAddEventListener("click", stopPropagation))
  
  document.body.removeAndAddEventListener("click", closeDropdown)
  document.body.removeAndAddEventListener("keydown", closeOnKeyDown)
})

function closeDropdown(event) {
  if (!dropdownOpen) return

  const activeDropdown = document.querySelector("[data-dropdown-content].active")
  if (activeDropdown) activeDropdown.classList.remove("active")

  dropdownOpen = false
}

function closeOnKeyDown(event) {
  if (!dropdownOpen) return
  if (event.key === "Escape") closeDropdown()
}

function toggleDropdown(event) {
  event.preventDefault()

  const parent = this.closest("[data-dropdown]")
  const target = parent.querySelector("[data-dropdown-content]")

  const activeDropdown = document.querySelector("[data-dropdown-content].active")
  if (activeDropdown && activeDropdown != target) activeDropdown.classList.remove("active")

  target.classList.toggle("active")
  dropdownOpen = target.classList.contains("active")
}

function stopPropagation(event) {
  event.stopPropagation()
}

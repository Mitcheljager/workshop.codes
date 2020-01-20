let dropdownOpen = false

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='toggle-dropdown']")
  const dropdowns = document.querySelectorAll("[data-dropdown]")

  elements.forEach((element) => element.removeEventListener("click", toggleDropdown))
  elements.forEach((element) => element.addEventListener("click", toggleDropdown))

  dropdowns.forEach((dropdown) => dropdown.removeEventListener("click", stopPropagation))
  dropdowns.forEach((dropdown) => dropdown.addEventListener("click", stopPropagation))

  document.body.removeEventListener("click", closeDropdown)
  document.body.addEventListener("click", closeDropdown)

  document.body.removeEventListener("keydown", closeOnKeyDown)
  document.body.addEventListener("keydown", closeOnKeyDown)
})

function closeDropdown(event) {
  if (!dropdownOpen) return

  const activeDropdown = document.querySelector("[data-dropdown-content].active")
  if (activeDropdown) activeDropdown.classList.remove("active")

  dropdownOpen = false
}

function closeOnKeyDown(event) {
  if (!dropdownOpen && event.key !== "Escape") return
  closeDropdown()
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

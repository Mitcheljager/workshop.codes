document.addEventListener("turbolinks:load", function() {
  document.body.removeAndAddEventListener("click", toggleDropdown)
  document.body.removeAndAddEventListener("keydown", closeOnKeyDown)
})

function toggleDropdown(event) {
  closeDropdown(event)

  let eventTarget = event.target
  if (eventTarget.dataset.action != "toggle-dropdown") eventTarget = event.target.closest("[data-action~='toggle-dropdown']")
  if (!eventTarget) return

  event.preventDefault()

  const parent = eventTarget.closest("[data-dropdown]")
  const target = parent.querySelector("[data-dropdown-content]")
  
  target.classList.toggle("active")
}

function closeDropdown(event) {
  const activeDropdown = document.querySelector("[data-dropdown-content].active")
  if (activeDropdown) activeDropdown.classList.remove("active")
}

function closeOnKeyDown(event) {
  if (event.key === "Escape") closeDropdown(event)
}

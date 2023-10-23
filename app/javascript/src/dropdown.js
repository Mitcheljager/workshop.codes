export function bind() {
  document.body.removeAndAddEventListener("click", toggleDropdown)
  document.body.removeAndAddEventListener("keydown", closeOnKeyDown)
}

function toggleDropdown(event) {
  closeDropdown(event)

  let eventTarget = event.target
  if (eventTarget.dataset.action != "toggle-dropdown") eventTarget = event.target.closest("[data-action~='toggle-dropdown']")
  if (!eventTarget) return

  event.preventDefault()

  const parent = eventTarget.closest("[data-dropdown]")
  const target = parent.querySelector("[data-dropdown-content]")
  
  target.dataset.active = !JSON.parse(target.dataset.active || "false")
  target.classList.toggle("active", JSON.parse(target.dataset.active))
}

function closeDropdown(event) {
  const activeDropdown = document.querySelector("[data-dropdown-content].active")
  if (!activeDropdown) return

  
  const eventTarget = event.target.closest("[data-dropdown]")
  if (eventTarget && event.type != "keydown" && eventTarget.querySelector("[data-dropdown-content]") == activeDropdown) return
  
  
  activeDropdown.classList.remove("active")
  activeDropdown.dataset.active = false
}

function closeOnKeyDown(event) {
  if (event.code === "Escape") closeDropdown(event)
}

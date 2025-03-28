export function bind(): void {
  document.body.removeAndAddEventListener("click", toggleDropdown)
  document.body.removeAndAddEventListener("keydown", closeOnKeyDown)
}

export function toggleDropdown(event: Event): void {
  closeDropdown(event)

  let eventTarget = event.target as HTMLElement
  if (eventTarget.dataset.action != "toggle-dropdown") eventTarget = eventTarget.closest("[data-action~='toggle-dropdown']") as HTMLElement
  if (!eventTarget) return

  event.preventDefault()

  const parent = eventTarget.closest("[data-dropdown]")
  const target = parent?.querySelector("[data-dropdown-content]") as HTMLElement | null

  if (!target) return

  target.dataset.active = (!JSON.parse(target.dataset.active || "false")).toString()
  target.classList.toggle("active", JSON.parse(target.dataset.active))
}

export function closeDropdown(event: Event | null, closeActive = false): void {
  const activeDropdown = document.querySelector("[data-dropdown-content].active") as HTMLElement
  if (!activeDropdown) return

  const eventTarget = (event?.target as HTMLElement)?.closest("[data-dropdown]")
  if (!closeActive && eventTarget && eventTarget.querySelector("[data-dropdown-content]") == activeDropdown) return

  activeDropdown.classList.remove("active")
  activeDropdown.dataset.active = "false"
}

function closeOnKeyDown(event: KeyboardEvent): void {
  if (event.code === "Escape") closeDropdown(event, true)
}

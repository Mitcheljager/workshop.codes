let page = 1
let hasShownOnce = false

export function render(): void {
  const element = document.querySelector("[data-role~='lootbox']") as HTMLElement | null

  if (!element) return
  if (localStorage.getItem("april-fools-2025-shown") === "true") return

  if (page === 1) {
    page++
    return
  }

  if (Math.random() < 0.5 && !hasShownOnce) return

  hasShownOnce = true

  element.classList.add("lootbox--active")

  document.removeAndAddEventListener("keydown", (event: KeyboardEvent) => {
    if (!event.ctrlKey && !event.metaKey) return

    localStorage.setItem("april-fools-2025-shown", "true")
  })
}

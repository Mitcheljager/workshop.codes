export function bind(): void {
  const element = document.querySelector("[data-role='search-table']")

  if (!element) return

  element.removeAndAddEventListener("input", searchTable)
}

function searchTable(event: InputEvent): void {
  const table = document.querySelector<HTMLTableElement>("table")

  if (!table) return

  const query = (event.target as HTMLInputElement).value.toLowerCase()
  const rows = table.rows

  for(const row of rows) {
    const rowContent = row.innerText.toLowerCase()

    row.style.display = rowContent.includes(query) ? "" : "none"
  }
}

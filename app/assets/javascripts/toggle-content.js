document.addEventListener("turbolinks:load", function() {
  document.removeEventListener("click", toggleContent)
  document.addEventListener("click", toggleContent)
})

function toggleContent(event) {
  let eventElement = event.target

  if (eventElement.dataset.action == null || !eventElement.dataset.action.includes("toggle-content")) {
    eventElement = eventElement.closest("[data-action~='toggle-content']")
  }

  if (eventElement && eventElement.dataset.action != null && eventElement.dataset.action.includes("toggle-content")) {
    event.preventDefault()

    const parent = eventElement.closest("[data-toggle-content]")

    const element = parent.querySelector("[data-role~='content-to-toggle']")
    const state = window.getComputedStyle(element).display === "none"

    element.style.display = state ? "initial" : "none"

    if (!state && eventElement.dataset.hideWith) {
      eventElement.textContent = eventElement.dataset.hideWith
    } else if (state && eventElement.dataset.showWith) {
      eventElement.textContent = eventElement.dataset.showWith
    }
  }
}

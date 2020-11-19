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
    const animationTiming = parseInt(eventElement.dataset.animationTiming) > 0 ? parseInt(eventElement.dataset.animationTiming) : 0

    if (!state) {
      parent.classList.add("fading-out")
      if (eventElement.dataset.hideWith) eventElement.textContent = eventElement.dataset.hideWith
    } else {
      if (animationTiming > 0) element.style.display = "initial"
      parent.classList.add("fading-in")
      if (eventElement.dataset.showWith) eventElement.textContent = eventElement.dataset.showWith
    }

    setTimeout(() => {
      element.style.display = state ? "initial" : "none"
      parent.classList.remove("fading-out")
      parent.classList.remove("fading-in")
    }, animationTiming)
  }
}

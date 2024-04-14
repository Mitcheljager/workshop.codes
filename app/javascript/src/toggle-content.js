export function bind() {
  document.body.removeAndAddEventListener("click", toggleContent)
}

function toggleContent(event) {
  let { target } = event

  if (!target) return

  if (target.dataset.action == null || !target.dataset.action.includes("toggle-content")) {
    target = target.closest("[data-action~='toggle-content']")
  }

  if (target && target.dataset.action != null && target.dataset.action.includes("toggle-content")) {
    event.preventDefault()

    const parent = target.closest("[data-toggle-content]")

    const element = parent.querySelector("[data-role~='content-to-toggle']")
    const state = window.getComputedStyle(element).display === "none"
    const animationTiming =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 :
        parseInt(target.dataset.animationTiming) > 0 ? parseInt(target.dataset.animationTiming) : 0

    if (!state) {
      target.classList.remove("active")
      parent.classList.add("fading-out")
      if (target.dataset.hideWith) target.textContent = target.dataset.hideWith
    } else {
      target.classList.add("active")
      if (animationTiming > 0) element.style.display = "initial"
      parent.classList.add("fading-in")
      if (target.dataset.showWith) target.textContent = target.dataset.showWith

      if (parent.dataset.closeOnOutsideClick !== undefined) {
        document.body.removeAndAddEventListener("click", closeOnOutsideClick)
      }
    }

    setTimeout(() => {
      element.style.display = state ? "initial" : "none"
      parent.classList.remove("fading-out")
      parent.classList.remove("fading-in")
    }, animationTiming)
  }
}

function closeOnOutsideClick({ target }) {
  if (target.closest("[data-toggle-content]")) return
  if (target.nodeName === "INPUT") return

  toggleContent({ target: document.querySelector("[data-toggle-content] .active"), preventDefault: () => null })
  document.body.removeEventListener("click", closeOnOutsideClick)
}

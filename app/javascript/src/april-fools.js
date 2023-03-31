import Impetus from "impetus"

export function bind() {
  const elements = document.querySelectorAll("[data-action='apply-class-to-parent-on-focus']")

  elements.forEach((element) => element.removeAndAddEventListener("focus", applyClass))

  document.body.removeAndAddEventListener("mousedown", hiimpetus)
}

function applyClass({ target }) {
  const parent = target.closest(target.dataset.selector)
  parent.classList.add(target.dataset.class)
}

async function hiimpetus(event) {
  let element = event.target
  if (!element?.classList.contains("item")) element = element.closest(".item")
  if (!element?.classList.contains("item")) return

  if (element.dataset.hasImpetus == "true") return
  element.dataset.hasImpetus = true

  new Impetus({
    source: element,
    friction: 0.96,
    boundX: [(window.innerWidth - element.offsetWidth - 100) * -0.5, (window.innerWidth - element.offsetWidth - 100) * 0.5],
    update: function(x, y) {
      element.style.transform = `translateX(${ x }px) translateY(${ y }px)`
      element.dataset.x = x
      element.dataset.y = y

      if (x || y) {
        element.style.zIndex = 2
        element.style.position = "relative"
        element.style.userSelect = "none"
      }
    }
  })

  element.dispatchEvent(new MouseEvent("mousedown", event))
}

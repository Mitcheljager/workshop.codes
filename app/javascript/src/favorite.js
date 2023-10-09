import FetchRails from "./fetch-rails"
import { addAlertError } from "./lib/alerts"

export function bind() {
  document.body.removeAndAddEventListener("click", favorite)
}

async function favorite(event) {
  let eventTarget = event.target
  if (eventTarget.dataset.action != "favorite") eventTarget = event.target.closest("[data-action~='favorite']")
  if (!eventTarget) return

  const postId = eventTarget.dataset.target
  const active = eventTarget.dataset.active == "true"
  const body = { favorite: { post_id: postId } }
  const imageSrc = active ? eventTarget.dataset.inactiveIcon : eventTarget.dataset.activeIcon
  const imageElement = eventTarget.querySelector("img")

  imageElement.src = imageSrc
  eventTarget.dataset.active = !active
  eventTarget.classList.toggle("favorite--is-active", !active)
  eventTarget.classList.toggle("favorite--animating", !active)

  new FetchRails("/favorites", body).post({ method: active ? "delete" : "post" })
    .then(() => {
      if (!active) window.dispatchEvent(new CustomEvent("favorite"))
    })
    .catch(() => {
      imageElement.src = !active ? eventTarget.dataset.inactiveIcon : eventTarget.dataset.activeIcon
      eventTarget.classList.toggle("favorite--is-active", active)
      eventTarget.dataset.active = active

      addAlertError("Something went wrong, please try again")
    })
}

import FetchRails from "@src/fetch-rails"
import { addAlertError } from "@src/lib/alerts"

export function bind() {
  document.body.removeAndAddEventListener("click", favorite)
}

async function favorite(event) {
  let eventTarget = event.target
  if (eventTarget.dataset.action != "favorite") eventTarget = event.target.closest("[data-action~='favorite']")

  if (eventTarget) toggleFavorite(eventTarget)
}

export function toggleFavorite(element) {
  const postId = element.dataset.target
  const active = element.dataset.active == "true"
  const body = { favorite: { post_id: postId } }
  const imageSrc = active ? element.dataset.inactiveIcon : element.dataset.activeIcon
  const imageElement = element.querySelector("img")

  imageElement.src = imageSrc
  element.dataset.active = !active
  element.classList.toggle("favorite--is-active", !active)
  element.classList.toggle("favorite--animating", !active)

  new FetchRails("/favorites", body).post({ method: active ? "delete" : "post" })
    .then(() => {
      if (!active) window.dispatchEvent(new CustomEvent("favorite"))
    })
    .catch(() => {
      imageElement.src = !active ? element.dataset.inactiveIcon : element.dataset.activeIcon
      element.classList.toggle("favorite--is-active", active)
      element.dataset.active = active

      addAlertError("Something went wrong, please try again")
    })
}

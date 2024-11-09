import FetchRails from "@src/fetch-rails"
import { addAlertError } from "@src/lib/alerts"

export function bind() {
  document.body.removeAndAddEventListener("click", favorite)
}

async function favorite(event: MouseEvent) {
  let eventTarget = event.currentTarget as HTMLElement
  if (eventTarget.dataset.action != "favorite") eventTarget = eventTarget.closest("[data-action~='favorite']") as HTMLElement

  if (eventTarget) toggleFavorite(eventTarget)
}

export function toggleFavorite(element: HTMLElement) {
  const postId = element.dataset.target
  const active = element.dataset.active == "true"
  const imageSrc = active ? element.dataset.inactiveIcon : element.dataset.activeIcon
  const imageElement = element.querySelector("img")

  if (imageElement && imageSrc) imageElement.src = imageSrc

  element.dataset.active = (!active).toString()
  element.classList.toggle("favorite--is-active", !active)
  element.classList.toggle("favorite--animating", !active)

  const body = { favorite: { post_id: postId } }

  new FetchRails("/favorites", body).post({ method: active ? "delete" : "post" })
    .then(() => {
      if (!active) window.dispatchEvent(new CustomEvent("favorite"))
    })
    .catch(() => {
      if (imageElement) imageElement.src = (!active ? element.dataset.inactiveIcon : element.dataset.activeIcon) || ""
      element.classList.toggle("favorite--is-active", active)
      element.dataset.active = active.toString()

      addAlertError("Something went wrong, please try again")
    })
}

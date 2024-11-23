import FetchRails from "@src/fetch-rails"
import { closeModal } from "@src/modal"
import * as revealBySelect from "@src/reveal-by-select"
import * as disableFormBySelect from "@src/disable-form-by-select"

export function bind(): void {
  document.body.removeAndAddEventListener("click", getReportsForm)
}

function getReportsForm(event: Event): void {
  let eventTarget = event.target as HTMLAnchorElement
  if (eventTarget.dataset.action != "get-reports-form") eventTarget = eventTarget.closest("[data-action='get-reports-form']") as HTMLAnchorElement

  if (!eventTarget) return

  event.preventDefault()

  const originalText = eventTarget.innerText
  eventTarget.innerText = "Loading..."

  new FetchRails(eventTarget.href).get()
    .then(data => {
      eventTarget.innerText = originalText
      document.body.insertAdjacentHTML("beforeend", data)

      const modal = document.querySelector("[data-modal='report']") as HTMLElement
      const backdrop = modal.querySelector(".modal__backdrop") as HTMLElement

      backdrop.removeAndAddEventListener("click", closeModal)
      revealBySelect.bind()
      disableFormBySelect.bind()
    })
}

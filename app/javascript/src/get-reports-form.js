import FetchRails from "./fetch-rails"
import { closeModal } from "./modal"
import * as revealBySelect from "../src/reveal-by-select"
import * as disableFormBySelect from "../src/disable-form-by-select"

export function bind() {
  document.body.removeAndAddEventListener("click", getReportsForm)
}

function getReportsForm(event) {
  let eventTarget = event.target
  if (eventTarget.dataset.action != "get-reports-form") eventTarget = event.target.closest("[data-action='get-reports-form']")
  if (!eventTarget) return

  event.preventDefault()

  const originalText = eventTarget.innerText
  eventTarget.innerText = "Loading..."

  new FetchRails(eventTarget.href).get()
    .then(data => {
      eventTarget.innerText = originalText
      document.body.insertAdjacentHTML("beforeend", data)

      const modal = document.querySelector("[data-modal='report']")
      const backdrop = modal.querySelector(".modal__backdrop")

      backdrop.removeAndAddEventListener("click", closeModal)
      revealBySelect.bind()
      disableFormBySelect.bind()
    })
}

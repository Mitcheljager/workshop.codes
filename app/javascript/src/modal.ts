export function bind() {
  const elements = document.querySelectorAll("[data-action='toggle-modal']")
  elements.forEach(element => element.removeAndAddEventListener("click", closeModal))

  const showModalElements = document.querySelectorAll("[data-action~='show-modal']")
  showModalElements.forEach(element => element.removeAndAddEventListener("click", showModal))

  const backdropElements = document.querySelectorAll("[data-role='modal-backdrop']")
  backdropElements.forEach(element => element.removeAndAddEventListener("click", closeModal))

  document.body.removeAndAddEventListener("keydown", closeModalOnKeyDown)
}

function showModal({ currentTarget }: { currentTarget: HTMLElement }) {
  const modal = document.querySelector(`[data-modal="${currentTarget.dataset.target}"]`) as HTMLElement

  if (!modal) return

  modal.style.display = "flex"

  document.body.style.borderRight = `${getScrollbarWidth()}px solid transparent`
  document.body.style.overflowY = "hidden"
}

export function closeModal() {
  const activeModal = document.querySelector(".modal:not([style*='none'])") as HTMLElement

  if (!activeModal) return
  if (activeModal.dataset.ignore != undefined) return

  if (activeModal.dataset.hideOnClose != undefined) {
    activeModal.style.display = "none"

    document.body.style.borderRight = "0"
    document.body.style.overflowY = "auto"
  } else {
    activeModal.remove()
  }
}

function closeModalOnKeyDown(event: KeyboardEvent) {
  if (event.code === "Escape") closeModal()
}

function getScrollbarWidth() {
  return window.innerWidth - document.body.offsetWidth
}

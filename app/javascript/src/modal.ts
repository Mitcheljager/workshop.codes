export function bind(): void {
  const elements = document.querySelectorAll("[data-action='toggle-modal']")
  elements.forEach(element => element.removeAndAddEventListener("click", closeModal))

  const showModalElements = document.querySelectorAll("[data-action~='show-modal']")
  showModalElements.forEach(element => element.removeAndAddEventListener("click", showModal))

  const backdropElements = document.querySelectorAll("[data-role='modal-backdrop']")
  backdropElements.forEach(element => element.removeAndAddEventListener("click", closeModal))

  document.body.removeAndAddEventListener("keydown", closeModalOnKeyDown)
}

function showModal({ currentTarget }: { currentTarget: HTMLElement }): void {
  const modal = document.querySelector(`[data-modal="${currentTarget.dataset.target}"]`) as HTMLElement

  if (!modal) return

  modal.style.display = "flex"

  document.body.style.borderRight = `${getScrollbarWidth()}px solid transparent`
  document.body.style.overflowY = "hidden"

  focusModal(modal)
}

export function closeModal(): void {
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

function closeModalOnKeyDown(event: KeyboardEvent): void {
  if (event.code === "Escape") closeModal()
}

function getScrollbarWidth(): number {
  return window.innerWidth - document.body.offsetWidth
}

export function focusModal(modal: HTMLElement): void {
  const firstFocusableElement = modal.querySelector("button:not(disabled), input:not([type='hidden']), select, [tabindex='0'], img") as HTMLFormElement
  if (firstFocusableElement) firstFocusableElement.focus()
}

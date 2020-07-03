document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='toggle-modal']")

  elements.forEach((element) => element.removeEventListener("click", closeModal))
  elements.forEach((element) => element.addEventListener("click", closeModal))

  document.body.removeEventListener("keydown", closeModalOnKeyDown)
  document.body.addEventListener("keydown", closeModalOnKeyDown)
})

function closeModal(event) {
  const activeModal = document.querySelector(".modal")
  if (activeModal) activeModal.remove()
}

function closeModalOnKeyDown(event) {
  if (event.key === "Escape") closeModal()
}

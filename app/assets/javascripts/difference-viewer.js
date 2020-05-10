document.addEventListener("turbolinks:load", function() {
  if (!document.querySelector(".diff")) return

  const toggleUnchangedFilesElement = document.querySelector("[data-action='toggle-unchanged-difference']")
  toggleUnchangedFilesElement.removeEventListener("input", toggleUnchangedFiles)
  toggleUnchangedFilesElement.addEventListener("input", toggleUnchangedFiles)

  const elements = document.querySelectorAll(".diff li")
  elements.forEach(element => {
    element.classList.add("microlight")
  })
})

function toggleUnchangedFiles(event) {
  const element = document.querySelector(".diff")
  const state = this.checked

  element.classList.toggle("hide-unchanged", state)
}

document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='copy-to-clipboard']")

  elements.forEach((element) => element.removeEventListener("click", copyToClipboard))
  elements.forEach((element) => element.addEventListener("click", copyToClipboard))
})

function copyToClipboard(event) {
  event.preventDefault()

  const target = this.dataset.target
  const targetElement = document.querySelector(`[data-copy="${ target }"]`)

  if (!targetElement) return

  const input = document.createElement("textarea")
  input.value = targetElement.innerHTML
  document.body.appendChild(input)

  input.select()
  document.execCommand("copy")
  document.body.removeChild(input)

  notificationElement = document.createElement("div")
  notificationElement.classList.add("copy__notification")
  notificationElement.innerHTML = "Copied"

  targetElement.closest(".copy").append(notificationElement)

  setTimeout(() => { targetElement.closest(".copy").querySelector(".copy__notification").remove() }, 1000)
}

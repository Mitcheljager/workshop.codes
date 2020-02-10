document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='copy-to-clipboard']")

  elements.forEach((element) => element.removeEventListener("click", copyToClipboard))
  elements.forEach((element) => element.addEventListener("click", copyToClipboard))
})

function copyToClipboard(event, optionalContent = undefined) {
  event.preventDefault()

  const element = this.length == undefined ? this : event.srcElement

  const target = element.dataset.target
  const targetElement = document.querySelector(`[data-copy="${ target }"]`)

  if (!targetElement) return

  const input = document.createElement("textarea")
  input.value = optionalContent || targetElement.textContent
  document.body.appendChild(input)

  input.select()
  document.execCommand("copy")
  document.body.removeChild(input)

  notificationElement = document.createElement("div")
  notificationElement.classList.add("copy__notification")
  notificationElement.innerHTML = "Copied"

  let copyParent = element.closest("div").querySelector(".copy")
  if (!copyParent) copyParent = element
  copyParent.append(notificationElement)

  setTimeout(() => { copyParent.querySelector(".copy__notification").remove() }, 1000)

  if (targetElement.dataset.trackCopy != undefined) trackCopyGA(targetElement.textContent)
}

function trackCopyGA(label) {
  if (typeof gtag !== "function") return

  fetch("/copy-code", {
    method: "post",
    body: JSON.stringify({ code: label }),
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })

  gtag("event", "Copy", {
    "event_category" : label
  })
}

document.addEventListener("turbolinks:load", function() {
  getUnreadNotifications()
})

function getUnreadNotifications() {
  fetch("/unread-notifications", {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })
  .then(response => response.text())
  .then(data => {
    const parsedData = JSON.parse(data)

    if (parsedData.length) showNotificationAlert(parsedData.length)
  })
}

function showNotificationAlert(count) {
  const element = document.createElement("a")
  element.href = "/notifications"
  element.classList.add("alert")
  element.innerText = `You have ${ count } unread notification${ count > 1 ? "s" : "" }`

  document.body.prepend(element)
}

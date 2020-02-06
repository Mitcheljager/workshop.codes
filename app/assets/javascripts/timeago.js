document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-role='timeago']")

  timeago.render(elements)
})

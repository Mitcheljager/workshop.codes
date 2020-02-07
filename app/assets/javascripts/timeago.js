document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-role='timeago']")

  if (elements.length) timeago.render(elements)
})

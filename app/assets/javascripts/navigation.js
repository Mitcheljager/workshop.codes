document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-action='toggle-navigation']")

  elements.forEach((element) => element.removeEventListener("click", toggleNavigation))
  elements.forEach((element) => element.addEventListener("click", toggleNavigation))
})


function toggleNavigation(event) {
  event.preventDefault()

  const target = document.querySelector("[data-role='navigation']")
  target.classList.toggle("profile-block--is-active")
}

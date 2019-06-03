document.addEventListener("DOMContentLoaded", function() {
  const forms = document.querySelectorAll("[data-search]")

  forms.forEach(form => form.removeEventListener("submit", setSearch))
  forms.forEach(form => form.addEventListener("submit", setSearch))
})

function setSearch(event) {
  event.preventDefault()

  const input = this.querySelector("[data-search-input]").value

  if(input) {
    window.location.href = `/search/${ input }`
  }
}

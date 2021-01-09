document.addEventListener("turbolinks:load", function() {
    const elements = document.querySelectorAll("[data-action='reveal-on-difference']")

    elements.forEach((element) => element.removeEventListener("change", toggleRevealOnDifference))
    elements.forEach((element) => element.addEventListener("change", toggleRevealOnDifference))
})

function toggleRevealOnDifference(event) {
    const value = this.value
    const original = this.dataset.original
    const different = value !== original && original !== undefined

    const elements = document.querySelectorAll("[data-role='reveal-on-difference']")

    elements.forEach(element => element.style.display = different ? "block" : "none")
}
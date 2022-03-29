import FetchRails from "./fetch-rails"

export function destroy() {
  const elements = document.querySelectorAll("[data-role~='april-fools']")

  elements.forEach((element) => element.parentNode.remove())
}

export function bind() {
  new FetchRails("/webhooks/april_fools").get().then(data => {
    const chance = parseInt(data)
    if (chance === NaN) return
    // Pick a random number between 1 and the configured chance, and if it's 1, or the user sets the `april-fools` parameter, show the April Fools joke.
    const randomNumber = Math.floor(Math.random() * chance) + 1
    const url = new URL(window.location.href)
    if (randomNumber !== 1 && !url.searchParams.get("april-fools")) return

    const alertsArea = document.querySelector("[data-role='alerts']")

    const foolsAlert = document.createElement("div")
    foolsAlert.dataset.role = "april-fools"
    foolsAlert.classList.add("alerts__alert", "alerts__alert--warning")
    foolsAlert.innerHTML = "<p class=\"mt-1/16 mb-1/16\">The server closed due to excessive Workshop script load. <a class=\"text-pure-white\" title=\"Click for explanation\" href=\"/explanation\" data-prefetch=\"false\">(?)</a></p><button name=\"button\" type=\"submit\" class=\"button p-0 pl-1/16 pr-1/16 text-white\" data-role=\"dismiss-parent\">✕</button>"

    alertsArea.appendChild(foolsAlert)
  })
}

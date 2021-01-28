document.addEventListener("turbolinks:load", renderAds)

function renderAds() {
  const elements = document.querySelectorAll(".adsbygoogle")

  elements.forEach(element => {
    if (element.dataset.adsbygoogleStatus == "done") return
    if (window.getComputedStyle(element.closest("div")).display === "none") return

    (adsbygoogle = window.adsbygoogle || []).push({})
  })
}

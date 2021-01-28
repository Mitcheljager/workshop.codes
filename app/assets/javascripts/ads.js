document.addEventListener("turbolinks:load", renderAds)

function renderAds() {
  const elements = document.querySelectorAll(".adsbygoogle")

  elements.forEach(element => {
    if (window.getComputedStyle(element.closest("div")).display === "none") return
    if (element.dataset.adsbygoogleStatus == "done") return

    (adsbygoogle = window.adsbygoogle || []).push({})
  })
}

document.addEventListener("turbolinks:load", renderAds)

function renderAds() {
  const elements = document.querySelectorAll(".adsbygoogle")

  elements.forEach(element => {
    (adsbygoogle = window.adsbygoogle || []).push({})
  })
}

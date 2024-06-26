export function bind(target = document) {
  const elements = target.querySelectorAll("[data-role~='lazy-video']")

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      const element = entry.target

      element.src = element.dataset.src
      if (element.dataset.autoplay === "true") element.play()
      observer.unobserve(element)
    })
  })

  elements.forEach(element => observer.observe(element))
}

export function bind() {
  const elements = document.querySelectorAll("[data-role~='lazy-video']")

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      const element = entry.target

      element.src = element.dataset.src
      observer.unobserve(element)
    })
  })

  elements.forEach(element => observer.observe(element))
}

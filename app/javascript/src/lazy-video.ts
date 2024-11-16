export function bind(target: HTMLElement | Document = document): void {
  const elements = target.querySelectorAll("[data-role~='lazy-video']")

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return

      const element = entry.target as HTMLVideoElement

      element.src = element.dataset.src || ""
      if (element.dataset.autoplay === "true") element.play()
      observer.unobserve(element)
    })
  })

  elements.forEach(element => observer.observe(element))
}

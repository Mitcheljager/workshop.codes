export function initializeSvelteComponent(name, Component) {
  const elements = document.querySelectorAll(`[data-svelte-component="${name}"]`)

  elements.forEach(element => {
    element.innerHTML = ""

    new Component({
      target: element,
      props: JSON.parse(element.dataset.svelteProps)
    })
  })
}

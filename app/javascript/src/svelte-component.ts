import { mount } from "svelte"

export function initializeSvelteComponent(name: string, Component: any): void {
  const elements = Array.from(document.querySelectorAll<HTMLElement>(`[data-svelte-component="${name}"]`))

  elements.forEach(element => {
    element.innerHTML = ""

    mount(Component, {
      target: element,
      props: JSON.parse(element.dataset.svelteProps || "{}")
    })
  })
}

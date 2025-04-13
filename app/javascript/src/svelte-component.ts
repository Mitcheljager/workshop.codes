import { mount } from "svelte"

export function initializeSvelteComponent(name: string, Component: any): void {
  const elements = Array.from(document.querySelectorAll(`[data-svelte-component="${name}"]`)) as HTMLElement[]

  elements.forEach(element => {
    element.innerHTML = ""

    mount(Component, {
      target: element,
      props: JSON.parse(element.dataset.svelteProps || "{}")
    })
  })
}

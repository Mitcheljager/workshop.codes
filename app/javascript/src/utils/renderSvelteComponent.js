export function renderSvelteComponent({ element, component, props = {} } = {}) {
  element.dataset.svelteComponent = component.name
  element.dataset.svelteProps = JSON.stringify(props)

  WebpackerSvelte.setup({ component })
}

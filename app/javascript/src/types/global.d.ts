declare global {
  declare namespace svelteHTML {
    interface HTMLAttributes {
      "onalert"?: (event: CustomEvent) => void,
      "onfavorite"?: (event: CustomEvent) => void
    }
  }
}

export {}

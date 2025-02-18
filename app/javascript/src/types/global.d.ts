declare global {
  declare namespace svelteHTML {
    interface HTMLAttributes {
      "onfavorite"?: (event: CustomEvent) => void
    }
  }
}

export {}

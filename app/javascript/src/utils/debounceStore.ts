import type { Writable } from "svelte/store"

export function debounced(callback: Function, wait: number) {
  return (values: any, set: (store: Writable<any>) => void) => {
    const timeout = setTimeout(() => {
      return set(callback(values))
    }, wait)

    return () => clearTimeout(timeout)
  }
}

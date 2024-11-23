export function debounced(callback: Function, wait: number) {
  return (values: any, set: (store: any) => void) => {
    const timeout = setTimeout(() => {
      return set(callback(values))
    }, wait)

    return () => clearTimeout(timeout)
  }
}

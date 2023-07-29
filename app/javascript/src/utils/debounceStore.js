export function debounced(callback, wait) {
  return (values, set) => {
    const timeout = setTimeout(() => {
      return set(callback(values))
    }, wait)
    return () => clearTimeout(timeout)
  }
}

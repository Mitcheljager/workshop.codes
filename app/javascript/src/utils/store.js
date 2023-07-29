export function debounced(cb, ms) {
  return (values, set) => {
    const timeout = setTimeout(() => {
      return set(cb(values))
    }, ms)
    return () => clearTimeout(timeout)
  }
}

export default function debounce<T extends(...args: any[]) => any>(fun: T, wait = 50, immediate = false): (this: ThisParameterType<T>, ...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null

  return function(this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context = this

    const later = () => {
      timeout = null
      if (!immediate) fun.apply(context, args)
    }

    const callNow = immediate && !timeout

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) fun.apply(context, args)
  }
}

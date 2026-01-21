export function toCapitalize(string: string): string {
  return string.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase())
}

export function truncate(string: string, limit: number, ellipsis = "..."): string {
  if (!string || string.length <= limit) return string
  return string.substring(limit - ellipsis.length) + ellipsis
}

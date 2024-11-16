export function removeComments(joinedItems: string): string {
  // Matches /*...*/ or //...
  const regex = /\/\*[\s\S]*?\*\/|(?<=^|[^:])\/\/.*$/gm
  return joinedItems.replaceAll(regex, "")
}

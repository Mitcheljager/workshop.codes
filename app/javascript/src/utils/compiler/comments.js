export function removeComments(joinedItems) {
  return joinedItems.replaceAll(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "")
}

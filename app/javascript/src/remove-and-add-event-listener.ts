// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Element {
  removeAndAddEventListener(event: string, fun: Function): void
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Document {
  removeAndAddEventListener(event: string, fun: Function): void
}

Element.prototype.removeAndAddEventListener = function(event, fun): void {
  // @ts-ignore
  this.removeEventListener(event, fun)
  // @ts-ignore
  this.addEventListener(event, fun)
}

Document.prototype.removeAndAddEventListener = function(event, fun): void {
  // @ts-ignore
  this.removeEventListener(event, fun)
  // @ts-ignore
  this.addEventListener(event, fun)
}

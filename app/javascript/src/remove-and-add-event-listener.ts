interface Element {
  removeAndAddEventListener(event: string, fun: Function): void
}

interface Document {
  removeAndAddEventListener(event: string, fun: Function): void
}

Element.prototype.removeAndAddEventListener = function(event, fun) {
  // @ts-ignore
  this.removeEventListener(event, fun)
  // @ts-ignore
  this.addEventListener(event, fun)
};

Document.prototype.removeAndAddEventListener = function(event, fun) {
  // @ts-ignore
  this.removeEventListener(event, fun)
  // @ts-ignore
  this.addEventListener(event, fun)
};

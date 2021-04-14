Element.prototype.removeAndAddEventListener = function(event, funct) {
  this.removeEventListener(event, funct)
  this.addEventListener(event, funct)
}

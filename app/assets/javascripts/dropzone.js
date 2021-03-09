document.addEventListener("turbolinks:load", function() {
  const elements = document.querySelectorAll("[data-role='dropzone']")

  elements.forEach(element => { new Dropzone(element).bind() })
})

class Dropzone {
  constructor(element) {
    this.element = element
  }

  bind() {  
    this.element.removeEventListener("dragover", () => { this.enter(event) })
    this.element.addEventListener("dragover", () => { this.enter(event) })
  
    this.element.removeEventListener("dragleave", () => { this.leave() })
    this.element.addEventListener("dragleave", () => { this.leave() })
  
    this.element.removeEventListener("drop", () => { this.drop(event) })
    this.element.addEventListener("drop", () => { this.drop(event) })
  
    this.element.removeEventListener("paste", () => { this.paste(event) })
    this.element.addEventListener("paste", () => { this.paste(event) })

    this.buildSortable()
  
    const removeElements = document.querySelectorAll("[data-action='remove-image']")
  
    if (removeElements.length) {
      removeElements.forEach(element => {
        element.removeEventListener("click", () => { this.remove(event) })
        element.addEventListener("click", () => { this.remove(event) })
      })
    }
  }
  
  enter(event) {
    event.preventDefault()
    this.element.classList.add("dropzone--is-active")
  }
  
  leave(event) {
    this.element.classList.remove("dropzone--is-active")
  }
  
  async drop(event) {
    event.preventDefault()
  
    this.element.classList.remove("dropzone--is-active")
    if (event.dataTransfer.items) this.readFiles(event.dataTransfer.items)
  }
  
  paste(event) {
    if (!document.querySelector(".tabs__item--active[data-target='images']")) return
  
    const items = (event.clipboardData || event.originalEvent.clipboardData).items
    this.readFiles(items)
  }
  
  readFiles(files) {
    for (var i = 0; i < files.length; i++) {
      if (files[i].kind === "file") {
        const file = files[i].getAsFile()
  
        if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg") {
          this.readImage(file)
        } else {
          alert("Wrong file type. Only png and jpeg are accepted.")
        }
      }
    }
  }
  
  readImage(file) {
    const reader = new FileReader()
    reader.readAsDataURL(file)
  
    reader.onload = event => {
      const image = new Image()
      image.src = event.target.result
  
      image.onload = () => {
        const uploader = new Uploader(file, "images")
  
        uploader.upload().then(() => {
          const interval = setInterval(() => {
            if (uploader.blob == "") return
            clearInterval(interval)
  
            this.drawAndRenderThumbnail(image, uploader.blob.id)
          }, 100)
        })
      }
    }
  }
  
  drawAndRenderThumbnail(image, imageId) {
    const thumbnailsElement = document.querySelector("[data-role~='form-image-thumbnails']")
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
  
    canvas.width = 120
    canvas.height = 120
  
    if (image.height > image.width) {
      const scaleFactor = canvas.width / image.width
      image.width = canvas.width
      image.height = image.height * scaleFactor
    } else {
      const scaleFactor = canvas.height / image.height
      image.height = canvas.height
      image.width = image.width * scaleFactor
    }
  
    ctx.drawImage(image, (canvas.width / 2) - (image.width / 2), (canvas.height / 2) - (image.height / 2), image.width, image.height)
  
    const thumbnail = new Image()
    thumbnail.src = canvas.toDataURL("image/jpeg")
  
    const thumbnailItem = document.createElement("div")
    thumbnailItem.classList.add("images-preview__item")
    thumbnailItem.dataset.id = imageId
  
    const removeElement = document.createElement("div")
    removeElement.classList.add("images-preview__action")
    thumbnailItem.dataset.imagePreviewItem = true
    thumbnailItem.dataset.action = "remove-image"
    removeElement.textContent = "Remove"
    removeElement.addEventListener("click", () => { this.remove(event) })
  
    thumbnailItem.append(thumbnail)
    thumbnailItem.append(removeElement)
  
    thumbnailsElement.append(thumbnailItem)
  
    this.updateSortable()
  }
  
  buildSortable() {
    const element = document.querySelector("[data-role~='sortable']")
  
    if (!element) return
  
    const sortable = Sortable.create(element, {
      animation: 50,
      onUpdate: () => { this.updateSortable() }
    })
  }
  
  updateSortable() {
    const element = document.querySelector(`[data-dropzone-target="${ this.element.dataset.target }"]`)
    const items = [...element.querySelectorAll("[data-image-preview-item]")]
    const array = items.map(item => parseInt(item.dataset.id))
  
    const input = document.querySelector(`[data-dropzone-image-order="${ this.element.dataset.target }"]`)
    input.value = JSON.stringify(array)
  }
  
  remove(event) {
    const element = event.target.closest("[data-image-preview-item]")
    element.remove()
  
    this.updateSortable()
  }
}

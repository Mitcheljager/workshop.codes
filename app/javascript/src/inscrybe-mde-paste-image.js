import Uploader from "./uploader"
import FetchRails from "./fetch-rails"

export default class InscrybeInsertImage {
  constructor(event, editor) {
    this.event = event,
    this.editor = editor,
    this.file = ""
  }

  paste() {
    const items = (this.event.clipboardData || this.event.originalEvent.clipboardData).items
    this.readFiles(items)
  }

  input() {
    const items = this.event.target.files
    this.file = items[0]
    
    this.isFileImage()
  }

  readFiles(files) {
    if (files[0].kind === "file") {
      this.file = files[0].getAsFile()
      this.isFileImage()
    }
  }

  isFileImage() {
    if (this.file.type == "image/png" || this.file.type == "image/jpg" || this.file.type == "image/jpeg") {
      this.drawImageOnCanvas()
    }
  }

  drawImageOnCanvas() {
    const reader = new FileReader()
    reader.readAsDataURL(this.file)

    reader.onload = event => {
      let image = new Image()
      image.src = event.target.result

      image.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        image = this.resizeImageToFit(image)

        canvas.width = image.width
        canvas.height = image.height

        ctx.drawImage(
          image, 0, 0,
          image.width,
          image.height
        )

        ctx.canvas.toBlob(blob => {
          const filename =  Math.random().toString(36).substring(2, 15) + ".jpeg"
          const renderedImage = new File([blob], filename, {
            type: "image/jpeg",
            quality: 0.95,
            lastModified: Date.now()
          })

          this.upload(renderedImage)
        }, "image/jpeg", 0.95)
      }
    }
  }

  resizeImageToFit(image) {
    if (image.width > image.height) {
      if (image.width > 1920) {
        const ratio = (1 / image.width) * 1920

        image.width = 1920
        image.height = image.height * ratio
      }
    } else {
      if (image.height > 1080) {
        const ratio = (1 / image.height) * 1080

        image.height = 1080
        image.width = image.width * ratio
      }
    }

    return image
  }

  upload(image) {
    const randomId = Math.random().toString().substr(2, 8)
    const uploader = new Uploader(image, document.querySelector("input[type='file'][name*='[images]']"))

    this.insertPlaceholderText(randomId)

    uploader.upload().then(() => {
      const interval = setInterval(() => {
        if (uploader.blob == "") return

        clearInterval(interval)

        if (uploader.progress == 100) {
          new FetchRails(`/active_storage_blob_variant_url/${ uploader.blob.key }`)
          .get().then(data => this.replaceMarkerWithImage(randomId, data))
          .catch(error => alert(error))
        }
      }, 100)
    })
    .catch(error => alert(error))
  }

  insertPlaceholderText(randomId) {
    const position = this.editor.getCursor()

    const markerElement = document.createElement("span")
    markerElement.classList.add("text-dark")
    markerElement.innerText = "[Uploading image...]"

    const marker = this.editor.setBookmark(position, { widget: markerElement })
    marker.randomId = randomId
  }

  replaceMarkerWithImage(randomId, url) {
    const marker = this.editor.getAllMarks().find(m => m.randomId == randomId)
                
    const cursorPosition = this.editor.getCursor()
    const position = marker.find()
    this.editor.setSelection(position, position)
    this.editor.replaceSelection(`![](${ url })`)

    this.editor.setSelection(cursorPosition, cursorPosition)

    marker.clear()
  }
}

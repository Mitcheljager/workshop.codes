import { DirectUpload } from "@rails/activestorage"

export default class Uploader {
  constructor(file, input) {
    this.file = file
    this.input = input
    this.blob = ""
    this.progress = 0
  }

  async upload() {
    const directUploadUrl = document.querySelector("[data-direct-upload-url]").dataset.directUploadUrl
    const upload = new DirectUpload(this.file, directUploadUrl, this)

    upload.create((error, blob) => {
      if (error) throw new Error("Something went wrong when uploading the image.")

      this.blob = blob

      const hiddenField = document.createElement("input")
      hiddenField.setAttribute("type", "hidden")
      hiddenField.setAttribute("value", blob.signed_id)
      hiddenField.name = this.input.name

      this.input.closest("form").appendChild(hiddenField)
    })
  }

  directUploadWillStoreFileWithXHR(request, xhr) {
    request.upload.addEventListener("progress", event => this.directUploadDidProgress(event))
  }

  directUploadDidProgress(event) {
    this.progress = Math.round((100 / event.total) * event.loaded)
  }
}

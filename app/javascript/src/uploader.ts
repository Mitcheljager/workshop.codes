import { DirectUpload } from "@rails/activestorage"

export default class Uploader {
  file: File
  input: HTMLInputElement
  blob: ActiveStorage.Blob | null
  progress: number

  constructor(file: File, input: HTMLInputElement) {
    this.file = file
    this.input = input
    this.blob = null
    this.progress = 0
  }

  async upload() {
    const element = document.querySelector("[data-direct-upload-url]") as HTMLElement
    const directUploadUrl = element.dataset.directUploadUrl || ""
    const upload = new DirectUpload(this.file, directUploadUrl, this)

    upload.create((error, blob) => {
      if (error) throw new Error("Something went wrong when uploading the image.")

      this.blob = blob as ActiveStorage.Blob

      const hiddenField = document.createElement("input")
      hiddenField.setAttribute("type", "hidden")
      hiddenField.setAttribute("value", blob.signed_id)
      hiddenField.name = this.input.name

      this.input.closest("form")?.appendChild(hiddenField)
    })
  }

  directUploadWillStoreFileWithXHR(request: XMLHttpRequest) {
    request.upload.addEventListener("progress", event => this.directUploadDidProgress(event))
  }

  directUploadDidProgress(event: ProgressEvent<XMLHttpRequestEventTarget>) {
    this.progress = Math.round((100 / event.total) * event.loaded)
  }
}

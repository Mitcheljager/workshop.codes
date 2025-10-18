import { DirectUpload } from "@rails/activestorage"

interface ExtendedBlob extends ActiveStorage.Blob {
  key: string,
  id: string
}

export default class Uploader {
  file: File
  input: HTMLInputElement
  blob: ExtendedBlob | null
  progress: number

  constructor(file: File, input: HTMLInputElement) {
    this.file = file
    this.input = input
    this.blob = null
    this.progress = 0
  }

  async upload(): Promise<void> {
    const element = document.querySelector<HTMLElement>("[data-direct-upload-url]")!
    const directUploadUrl = element.dataset.directUploadUrl || ""
    const upload = new DirectUpload(this.file, directUploadUrl, this)

    upload.create((error, blob) => {
      if (error) throw new Error("Something went wrong when uploading the image.")

      this.blob = blob as ExtendedBlob

      const hiddenField = document.createElement("input")
      hiddenField.setAttribute("type", "hidden")
      hiddenField.setAttribute("value", blob.signed_id)
      hiddenField.name = this.input.name

      this.input.closest("form")?.appendChild(hiddenField)
    })
  }

  directUploadWillStoreFileWithXHR(request: XMLHttpRequest): void {
    request.upload.addEventListener("progress", event => this.directUploadDidProgress(event))
  }

  directUploadDidProgress(event: ProgressEvent<XMLHttpRequestEventTarget>): void {
    this.progress = Math.round((100 / event.total) * event.loaded)
  }
}

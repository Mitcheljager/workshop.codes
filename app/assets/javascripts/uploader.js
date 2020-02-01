class Uploader {
  constructor(file, name) {
    this.file = file
    this.name = name
    this.blob = ""
    this.progressElement = document.createElement("div")
  }

  async upload() {
    const element = document.querySelector("input[type='file'][name*='" + this.name + "']")
    const upload = new ActiveStorage.DirectUpload(this.file, element.dataset.directUploadUrl, this)

    this.createProgressElement()

    upload.create((error, blob) => {
      if (error) {
        alert("Something went wrong when uploading the image.")
      } else {
        this.blob = blob

        const hiddenField = document.createElement("input")
        hiddenField.setAttribute("type", "hidden")
        hiddenField.setAttribute("value", blob.signed_id)
        hiddenField.name = element.name

        document.querySelector("[data-role='post-form']").appendChild(hiddenField)
      }
    })
  }

  createProgressElement() {
    const imagesPreviewElement = document.querySelector("[data-role~='form-image-thumbnails']")

    this.progressElement.classList.add("images-preview__progress")
    const progressBarElement = document.createElement("div")
    progressBarElement.classList.add("images-preview__progress-bar")

    this.progressElement.append(progressBarElement)
    imagesPreviewElement.append(this.progressElement)
  }

  directUploadWillStoreFileWithXHR(request, xhr) {
    request.upload.addEventListener("progress", event => this.directUploadDidProgress(event))
  }

  directUploadDidProgress(event) {
    const progressPercentage = Math.round((100 / event.total) * event.loaded)
    const progressBarElement = this.progressElement.querySelector(".images-preview__progress-bar")
    progressBarElement.style.width = progressPercentage + "%"

    if (progressPercentage == 100) this.progressElement.remove()
  }
}

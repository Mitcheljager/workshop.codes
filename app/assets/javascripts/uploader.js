class Uploader {
  constructor(file, name) {
    this.file = file
    this.name = name
    this.blob = ""
  }

  async upload() {
    const element = document.querySelector("input[type='file'][name*='" + this.name + "']")
    const upload = new ActiveStorage.DirectUpload(this.file, element.dataset.directUploadUrl, this)

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

  directUploadWillStoreFileWithXHR(request, xhr) {
    request.upload.addEventListener("progress", event => this.directUploadDidProgress(event))
  }

  directUploadDidProgress(event) {
    const element = document.querySelector(`[data-file="${ this.file.name }"]`)

    if (!element) return

    const progressPercentage = Math.round((100 / event.total) * event.loaded)
    let progressElement = element.querySelector(".file-list__progress")

    if (!progressElement) {
      progressElement = document.createElement("div")
      progressElement.classList.add("file-list__progress")
      element.append(progressElement)
    }

    progressElement.style.width = progressPercentage + "%"

    if (progressPercentage == 100) {
      progressElement.remove()

      element.classList.add("file-list__item--upload-successful")
      setTimeout(() => { element.classList.remove("file-list__item--upload-successful") }, 500)
    }
  }
}

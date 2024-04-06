import Uploader from "@src/uploader"
import FetchRails from "@src/fetch-rails"
import { addAlertError } from "@src/lib/alerts"

export default class InscrybeInsertVideo {
  constructor(event, editor) {
    this.event = event,
    this.editor = editor,
    this.file = ""
    this.id = ""
  }

  input() {
    const items = this.event.target.files
    this.file = items[0]
    this.id = this.event.target.id

    this.isFileVideo()
  }

  readFiles(files) {
    if (files[0].kind === "file") {
      this.file = files[0].getAsFile()
      this.isFileVideo()
    }
  }

  isFileVideo() {
    if (this.file.type != "video/mp4") {
      addAlertError("Unsupported filetype. Only mp4 is supported.")
      return
    }

    if (this.file.size > 50 * 1048576) {
      addAlertError("File exceeds max filesize of 50MB.")
      return
    }

    this.videoToFile()
  }

  videoToFile() {
    const reader = new FileReader()

    reader.onload = event => {
      const fileContent = event.target.result
      const filename =  Math.random().toString(36).substring(2, 15) + ".mp4"
      const blob = new Blob([fileContent], { type: "video/mp4" })
      const blobFile = new File([blob], filename, {
        type: "video/mp4",
        lastModified: Date.now()
      })

      this.upload(blobFile)
    }

    reader.readAsArrayBuffer(this.file)
  }

  upload(video) {
    const randomId = Math.random().toString().substr(2, 8)
    const uploader = new Uploader(video, document.querySelector("input[type='file'][name*='[videos]']"))

    this.insertPlaceholderText(randomId)

    uploader.upload().then(() => {
      const interval = setInterval(() => {
        if (uploader.blob == "") return

        clearInterval(interval)

        if (uploader.progress == 100) {
          new FetchRails(`/active_storage_blob_variant_url/${uploader.blob.key}?type=video`)
            .get().then(data => this.replaceMarkerWithVideo(randomId, data))
            .catch(error => alert(error))
        }
      }, 100)
    }).catch(error => alert(error))
  }

  insertPlaceholderText(randomId) {
    const position = this.editor.getCursor()

    const markerElement = document.createElement("span")
    markerElement.classList.add("text-dark")
    markerElement.innerText = "[Uploading video...]"

    const marker = this.editor.setBookmark(position, { widget: markerElement })
    marker.randomId = randomId
  }

  replaceMarkerWithVideo(randomId, url) {
    const marker = this.editor.getAllMarks().find(m => m.randomId == randomId)

    const autoplay = document.querySelector("#autoplay" + this.id)?.checked

    const cursorPosition = this.editor.getCursor()
    const position = marker.find()
    this.editor.setSelection(position, position)
    this.editor.replaceSelection(`[video ${url}${autoplay ? " autoplay" : ""}]`)

    this.editor.setSelection(cursorPosition, cursorPosition)

    marker.clear()
  }
}

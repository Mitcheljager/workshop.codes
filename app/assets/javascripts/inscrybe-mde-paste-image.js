function textareaPasteImage(event, editor) {
  const items = (event.clipboardData || event.originalEvent.clipboardData).items
  textareaReadFiles(items, editor)
}

function textareaReadFiles(files, editor) {
  for (var i = 0; i < files.length; i++) {
    if (files[i].kind === "file") {
      const file = files[i].getAsFile()

      if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg") {
        drawImageOnCanvas(editor, file)
      }
    }
  }
}

function insertPlaceholderText(editor, randomId) {
  const position = editor.getCursor()

  const markerElement = document.createElement("span")
  markerElement.classList.add("text-dark")
  markerElement.innerText = "[Uploading image...]"

  const marker = editor.setBookmark(position, { widget: markerElement })
  marker.randomId = randomId
}

function drawImageOnCanvas(editor, file) {
  const reader = new FileReader()
  reader.readAsDataURL(file)

  reader.onload = event => {
    let image = new Image()
    image.src = event.target.result

    image.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      image = resizeImageToFit(image)

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

        textareaUploadImage(editor, renderedImage)
      }, "image/jpeg", 0.95)
    }
  }
}

function resizeImageToFit(image) {
  if (image.width > image.height) {
    if (image.width > 900) {
      const ratio = (1 / image.width) * 900

      image.width = 900
      image.height = image.height * ratio
    }
  } else {
    if (image.height > 500) {
      const ratio = (1 / image.height) * 500

      image.height = 500
      image.width = image.width * ratio
    }
  }

  return image
}

function textareaUploadImage(editor, image) {
  const randomId = Math.random().toString().substr(2, 8)
  const uploader = new Uploader(image, "images", "textarea", randomId)

  insertPlaceholderText(editor, randomId)

  uploader.upload().then(() => {
    const interval = setInterval(() => {
      if (uploader.blob == "") return

      clearInterval(interval)

      if (uploader.progress == 100) {
        getBlobVariantUrl(uploader.blob.key)
        .then(data => replaceMarkerWithImage(editor, randomId, data))
        .catch(error => alert(error))
      }
    }, 100)
  })
}

async function getBlobVariantUrl(key) {
  const response = await fetch(`/active_storage_blob_variant_url/${ key }`, {
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": Rails.csrfToken()
    },
    credentials: "same-origin"
  })

  const data = await response.text()
  return data
}

function replaceMarkerWithImage(editor, randomId, url) {
  const marker = editor.getAllMarks().find(m => m.randomId == randomId)
              
  const cursorPosition = editor.getCursor()
  const position = marker.find()
  editor.setSelection(position, position)
  editor.replaceSelection(`![](${ url })`)

  editor.setSelection(cursorPosition, cursorPosition)

  marker.clear()
}

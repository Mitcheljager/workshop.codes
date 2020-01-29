//= require simple-mde
//= require uploader
//= require activestorage
//= require sortablejs/Sortable

document.addEventListener("turbolinks:load", function() {
  bindDropzone()
  buildSortable()
})

function bindDropzone() {
  const element = document.querySelector("[data-role='dropzone']")

  if (!element) return

  element.removeEventListener("dragover", dropzoneEnter)
  element.addEventListener("dragover", dropzoneEnter)

  element.removeEventListener("dragleave", dropzoneLeave)
  element.addEventListener("dragleave", dropzoneLeave)

  element.removeEventListener("drop", dropzoneDrop)
  element.addEventListener("drop", dropzoneDrop)

  const removeElements = document.querySelectorAll("[data-action='remove-image']")

  if (!removeElements.length) return

  removeElements.forEach(element => element.removeEventListener("click", removeImage))
  removeElements.forEach(element => element.addEventListener("click", removeImage))
}

function dropzoneEnter(event) {
  event.preventDefault()
  this.classList.add("dropzone--is-active")
}

function dropzoneLeave(event) {
  this.classList.remove("dropzone--is-active")
}

async function dropzoneDrop(event) {
  event.preventDefault()

  this.classList.remove("dropzone--is-active")

  if (!event.dataTransfer.items) return

  for (var i = 0; i < event.dataTransfer.items.length; i++) {
    if (event.dataTransfer.items[i].kind === "file") {
      const file = event.dataTransfer.items[i].getAsFile()

      if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg") {
        readImage(file)
      }
    }
  }
}

function readImage(file) {
  const reader = new FileReader()
  reader.readAsDataURL(file)

  reader.onload = event => {
    const image = new Image()
    image.src = event.target.result

    image.onload = () => {
      drawImageOnCanvas(image)
    }
  }
}
function drawImageOnCanvas(image) {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = 900
  canvas.height = 500

  let scaleFactor = canvas.width / image.width
  image.width = canvas.width
  image.height = image.height * scaleFactor

  if (image.height < canvas.height) {
    scaleFactor = canvas.width / image.width
    image.height = canvas.height
    image.width = image.width * scaleFactor
  }

  ctx.drawImage(image, (canvas.width / 2) - (image.width / 2), (canvas.height / 2) - (image.height / 2), image.width, image.height)

  ctx.canvas.toBlob(blob => {
    const filename =  Math.random().toString(36).substring(2, 15) + ".jpeg"
    const file = new File([blob], filename, {
      type: "image/jpeg",
      quality: 0.95,
      lastModified: Date.now()
    })

    const uploader = new Uploader(file, "images")

    uploader.upload().then(() => {
      const interval = setInterval(() => {
        if (uploader.blob == "") return
        clearInterval(interval)

        drawAndRenderThumbnail(image, uploader.blob.id)
      }, 100)
    })

  }, "image/jpeg", 0.95)
}

function drawAndRenderThumbnail(image, imageId) {
  const thumbnailsElement = document.querySelector("[data-role~='form-image-thumbnails']")
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  canvas.width = 200
  canvas.height = 200

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
  thumbnailItem.dataset.action = "remove-image"
  removeElement.textContent = "Remove"
  removeElement.addEventListener("click", removeImage)

  thumbnailItem.append(thumbnail)
  thumbnailItem.append(removeElement)

  thumbnailsElement.append(thumbnailItem)

  updateSortable()
}

async function createUploaderPromise(file, type, resolve) {
  const uploader = new Uploader(file, type)

  uploader.upload().then(() => {
    const interval = setInterval(() => {
      if (uploader.blob == "") return
      clearInterval(interval)

      resolve(uploader.blob)
    }, 100)
  })
}

function buildSortable() {
  const element = document.querySelector("[data-role~='sortable']")

  if (!element) return

  const sortable = Sortable.create(element, {
    animation: 50,
    onUpdate: () => { updateSortable() }
  })
}

function updateSortable() {
  const element = document.querySelector("[data-role*='form-image-thumbnails']")
  const items = [...element.querySelectorAll(".images-preview__item")]
  const array = items.map(item => parseInt(item.dataset.id))

  const input = document.querySelector("input[name*='image_order']")
  input.value = JSON.stringify(array)
}

function removeImage(event) {
  console.log("aa")
  const element = event.target.closest(".images-preview__item")
  element.remove()

  updateSortable()
}

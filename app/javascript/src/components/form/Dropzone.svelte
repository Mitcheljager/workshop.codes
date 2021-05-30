<script>
  import { fade } from "svelte/transition"
  import { flip } from "svelte/animate"
  import { onMount } from "svelte"
  import Sortable from "sortablejs"

  import Uploader from "../../uploader"
  import FetchRails from "../../fetch-rails"
  import debounce from "../../debounce"

  export let images
  export let label
  export let help
  export let input
  export let orderInput

  let listElement
  let sortable
  let active = false
  let alert = ""

  $: if (alert) setTimeout(() => { alert = "" }, 3000)
  $: updateOrder(images)

  onMount(() => {
    input = document.querySelector(`[type="file"][name="${ input }"]`)
    orderInput = document.querySelector(`[name="${ orderInput }"]`)
    createSortable()
  })

  const updateOrder = debounce(() => {
    const listItems = listElement.querySelectorAll("[data-id]")
    let order = Array.from(listItems).map(item => { if (item.isConnected) return parseInt(item.dataset.id) })
    order = order.filter(i => i)

    orderInput.value = JSON.stringify(order)
  }, 500)

  function createSortable() {
    sortable = new Sortable(listElement, {
      animation: 100,
      store: {
        set: updateOrder
      }
    })
  }

  function drop(event) {
    active = false

    const files = event.dataTransfer.items
    if (files) readFiles(files)
  }

  function readFiles(files) {
    Array.from(files).forEach(file => {
      if (file.kind !== "file") return
      
      file = file.getAsFile()

      if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg") {
        uploadImage(file)
      } else {
        alert = "Wrong file type. Only png and jpeg are accepted."
      }
    })
  }

  function uploadImage(image) {
    const uploader = new Uploader(image, input)
    
    uploader.upload().then(() => {
      const randomId = Math.random().toString(36).substr(2, 9)
      images = [...images, { id: randomId, type: "preview" }]

      const interval = setInterval(() => {
        setProgress(randomId, uploader.progress)

        if (!uploader.blob) return
        if (uploader.progress != 100) return

        clearInterval(interval)

        new FetchRails(`/active_storage_blob_variant_url/${ uploader.blob.key }?type=thumbnail`)
        .get()
        .then(data => setImage(randomId, uploader.blob.id, data))
        .catch(() => alert = "Something went wrong when retrieving your image")
      }, 100)
    })
    .catch(error => alert = error)
  }

  function setProgress(id, progress) {
    images = images.map(i => {
      if (i.id != id) return i

      return { ...i, progress }
    })
  }

  function setImage(id, blobId, url) {
    images = images.map(i => {
      if (i.id != id) return i

      return { id: blobId, url }
    })
  }

  function removeImage(id) {
    images = images.filter(i => i.id != id)
  }
</script>



<div
  class="dropzone"
  class:dropzone--is-active={ active }
  on:dragover|preventDefault={ () => active = true }
  on:dragleave={ () => active = false}
  on:drop|preventDefault={ drop }>

  <span>{ label }</span>

  <small>{ help }</small>
</div>

{ #if images.length }
  <small class="form-hint"><em>Drag images to change their order. The first image will be your thumbnail.</em></small>
{ /if }

<div class="images-preview" bind:this={ listElement }>
  { #each images as image (image.id) }
    <div
      class="images-preview__item"
      data-id={ image.id }
      transition:fade={{ duration: 200 }}
      animate:flip={{ duration: 200 }}>
      
      { #if image.type == "preview" }
        <div class="images-preview__progress">
          <div class="images-preview__progress-bar" style="width: { image.progress }%" />
        </div>
      { :else }
        <img src={ image.url } height=120 width=120 alt="Dropzone preview" />
      { /if }

      <div class="images-preview__action" on:click={ () => removeImage(image.id) }>X</div>
    </div>
  { /each }
</div>

{ #if alert }
  <div class="alert alert--error">
    { alert }
  </div>
{ /if }

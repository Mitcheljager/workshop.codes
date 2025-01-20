<script>
  import { fade } from "svelte/transition"
  import { flip } from "svelte/animate"
  import { onMount } from "svelte"
  import Sortable from "sortablejs"

  import { escapeable } from "@components/actions/escapeable"
  import { addAlertError } from "@lib/alerts"
  import Uploader from "@src/uploader"
  import FetchRails from "@src/fetch-rails"
  import debounce from "@src/debounce"

  export let images
  export let label
  export let help
  export let button
  export let input
  export let orderInput
  export let maxDimensions = 3500
  export let maxSizeMB = 2

  const imagePreviewWidth = 200

  let listElement
  let active = false
  let previewImageUrl = ""

  $: updateOrder(images)

  onMount(() => {
    input = document.querySelector(`[type="file"][name="${input}"]`)
    orderInput = document.querySelector(`[name="${orderInput}"]`)
    createSortable()
  })

  const updateOrder = debounce(() => {
    const listItems = listElement.querySelectorAll("[data-id]")
    let order = Array.from(listItems).map(item => { if (item.isConnected) return parseInt(item.dataset.id) })
    order = order.filter(i => i)

    orderInput.value = JSON.stringify(order)
  }, 500)

  function createSortable() {
    new Sortable(listElement, {
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

  function changeInput(event) {
    const files = event.target.files
    if (files) readFiles(files)
  }

  function readFiles(files) {
    Array.from(files).forEach(async file => {
      if (file.kind == "file") file = file.getAsFile()

      if (file.type != "image/png" && file.type != "image/jpg" && file.type != "image/jpeg") {
        addAlertError("Wrong file type. Only png and jpeg are accepted.")
        return
      }

      if (!await isAcceptableSize(file)) {
        addAlertError(`Image "${file.name}" is too large. Image exceeds ${maxDimensions}x${maxDimensions} or ${maxSizeMB}MB`)
        return
      }

      uploadImage(file)
    })
  }

  function uploadImage(image) {
    const uploader = new Uploader(image, input)

    uploader.upload().then(() => {
      const randomId = Math.random().toString(36).substr(2, 9)
      images = [...images, { id: randomId, type: "preview" }]

      const interval = setInterval(async() => {
        setProgress(randomId, uploader.progress)

        if (!uploader.blob) return
        if (uploader.progress != 100) return

        clearInterval(interval)

        try {
          const [thumbnail, preview] = await Promise.all([
            new FetchRails(`/active_storage_blob_variant_url/${uploader.blob.key}?type=thumbnail`).get(),
            new FetchRails(`/active_storage_blob_variant_url/${uploader.blob.key}?type=full`).get()
          ])

          setImage(randomId, uploader.blob.id, thumbnail, preview)
        } catch (error) {
          addAlertError("Something went wrong when retrieving your image")
        }
      }, 100)
    }).catch(error => addAlertError(error))
  }

  function setProgress(id, progress) {
    images = images.map(i => {
      if (i.id != id) return i

      return { ...i, progress }
    })
  }

  function setImage(id, blobId, thumbnail, preview) {
    images = images.map(i => {
      if (i.id != id) return i

      return { id: blobId, url: thumbnail, preview_url: preview }
    })
  }

  function removeImage(id) {
    if (!confirm("Are you sure you wish to remove this image? This can not be undone after saving, but you can always re-upload the image.")) return
    images = images.filter(i => i.id != id)
  }

  async function isAcceptableSize(file) {
    return new Promise(resolve => {
      const image = new Image()
      image.src = URL.createObjectURL(file)

      image.onload = () => {
        const { width, height } = image

        URL.revokeObjectURL(image.src)

        if (Math.max(width, height) > maxDimensions) resolve(false)
        if (file.size > maxSizeMB * 1048576) resolve(false)

        return resolve(true)
      }
    })
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="dropzone"
  class:dropzone--is-active={active}
  use:escapeable
  on:escape={() => previewImageUrl = ""}
  on:dragover|preventDefault={() => active = true}
  on:dragleave={() => active = false}
  on:drop|preventDefault={drop}>

  <span>{label}</span>

  <small>{help}</small>

  <label class="dropzone__button button button--secondary mt-1/4">
    {button}

    <input type="file" multiple="true" accept="image/png, image/jpeg, image/jpg" on:change={changeInput} tabindex="-1" />
  </label>
</div>

{#if images.length}
  <small class="form-hint"><em>Drag images to change their order. The first image will be your thumbnail.</em></small>
{/if}

<div class="images-preview" bind:this={listElement}>
  {#each images as image, i (image.id)}
    <div
      class="images-preview__item"
      data-id={image.id}
      transition:fade={{ duration: 200 }}
      animate:flip={{ duration: 200 }}>

      {#if image.type == "preview"}
        <div class="images-preview__progress">
          <div class="images-preview__progress-bar" style="width: {image.progress}%" />
        </div>
      {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <img
          on:click={() => previewImageUrl = image.preview_url}
          src={image.url}
          height={imagePreviewWidth / 9 * 5}
          width={imagePreviewWidth}
          alt="" />
      {/if}

      <button class="images-preview__action images-preview__action--close" on:click|stopPropagation|preventDefault={() => removeImage(image.id)} aria-label="Upload image {i + 1}">
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>
      </button>
    </div>
  {/each}
</div>

{#if previewImageUrl}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
  <div class="modal modal--auto" transition:fade={{ duration: 100 }} on:click={() => previewImageUrl = ""} data-hide-on-close role="dialog" aria-label="Image preview">

    <div class="modal__content p-0">
      <img class="img-fluid" src={previewImageUrl} alt="" />
    </div>

    <div class="modal__backdrop" />
  </div>
{/if}

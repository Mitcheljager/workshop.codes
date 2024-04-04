import { initializeSvelteComponent } from "@src/svelte-component"
import Sortable from "sortablejs"
import LimitedCheckboxes from "@components/form/LimitedCheckboxes.svelte"
import FetchRails from "@src/fetch-rails"

export function bind() {
  const element = document.querySelector("[data-role~='block-sortable']")

  if (element) buildBlockSortable(element)

  const createBlockElements = document.querySelectorAll("[data-action~='create-block']")
  createBlockElements.forEach(element => element.removeAndAddEventListener("click", createBlock))
}

function createBlock() {
  if (this.dataset.disabled == "true") return

  this.dataset.disabled = true

  new FetchRails("/blocks", { block: { content_type: this.dataset.contentType, name: this.dataset.name } })
    .post().then(data => {
      new Promise((resolve) => new Function("resolve", data)(resolve))
      renderSvelteComponents()
    }).finally(() => {
      this.dataset.disabled = false
    })
}

function buildBlockSortable(element) {
  Sortable.create(element, {
    draggable: "[data-sortable-block]",
    animation: 50,
    onUpdate: () => { updateBlockSortable() }
  })
}

function updateBlockSortable() {
  const blocks = document.querySelectorAll(".content-block")

  const positions = []
  blocks.forEach((block, i) => positions.push({ id: [block.dataset.id], position: i }))

  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  new FetchRails("/blocks/set_positions", { blocks: positions })
    .post().finally(() => {
      progressBar.setValue(1)
      progressBar.hide()
    })
}

function renderSvelteComponents() {
  initializeSvelteComponent("LimitedCheckboxes", LimitedCheckboxes)
}

export function insertBlockTemplate(event) {
  event.preventDefault()

  const template = document.getElementById(`${this.dataset.template}`).content.cloneNode(true)
  const targetElement = document.querySelector(`[data-template-target="${this.dataset.target}"]`)

  targetElement.append(template)
}

export function removeBlockTemplate(event) {
  event.preventDefault()

  const target = event.target.closest("[data-remove-target]")
  target.remove()
}

export function buildInputSortable(element) {
  Sortable.create(element, {
    animation: 50,
    handle: "[data-role~='sortable-handle']"
  })
}

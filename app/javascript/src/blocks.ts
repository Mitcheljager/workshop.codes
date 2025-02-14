import { initializeSvelteComponent } from "@src/svelte-component"
import Sortable from "sortablejs"
import LimitedCheckboxes from "@components/form/LimitedCheckboxes.svelte"
import FetchRails from "@src/fetch-rails"

export function bind(): void {
  const element = document.querySelector("[data-role~='block-sortable']") as HTMLElement

  if (element) buildBlockSortable(element)

  const createBlockElements = document.querySelectorAll("[data-action~='create-block']")
  createBlockElements.forEach(element => element.removeAndAddEventListener("click", createBlock))
}

function createBlock({ currentTarget }: { currentTarget: HTMLElement }): void {
  if (currentTarget.dataset.disabled == "true") return

  const loadingElement = document.querySelector("[data-role~='blocks-loading-indicator']") as HTMLElement

  currentTarget.dataset.disabled = "true"
  loadingElement!.style.display = "block"

  new FetchRails("/blocks", { block: { content_type: currentTarget.dataset.contentType, name: currentTarget.dataset.name } })
    .post().then(data => {
      new Promise((resolve) => new Function("resolve", data.toString())(resolve)) // Execute the result of blocks/create.js.erb
      renderSvelteComponents()

      loadingElement!.style.display = "none"
    }).finally(() => {
      currentTarget.dataset.disabled = "false"
    })
}

function buildBlockSortable(element: HTMLElement): void {
  Sortable.create(element, {
    draggable: "[data-sortable-block]",
    animation: 50,
    onUpdate: () => { updateBlockSortable() }
  })
}

function updateBlockSortable(): void {
  const blocks = Array.from(document.querySelectorAll(".content-block")) as HTMLElement[]

  const positions: { id: any[]; position: number }[] = []
  blocks.forEach((block, i) => positions.push({ id: [block.dataset.id], position: i }))

  // @ts-ignore
  const progressBar = new Turbolinks.ProgressBar()
  progressBar.setValue(0)
  progressBar.show()

  new FetchRails("/blocks/set_positions", { blocks: positions })
    .post().finally(() => {
      progressBar.setValue(1)
      progressBar.hide()
    })
}

function renderSvelteComponents(): void {
  initializeSvelteComponent("LimitedCheckboxes", LimitedCheckboxes)
}

export function insertBlockTemplate(event: MouseEvent): void {
  event.preventDefault()

  const currentTarget = event.currentTarget as HTMLElement
  const templateElement = document.getElementById(`${currentTarget.dataset.template}`) as HTMLFormElement
  const template = templateElement.content.cloneNode(true)
  const targetElement = document.querySelector(`[data-template-target="${currentTarget.dataset.target}"]`)

  targetElement!.append(template)
}

export function removeBlockTemplate(event: MouseEvent): void {
  event.preventDefault()

  const currentTarget = event.currentTarget as HTMLElement
  const target = currentTarget.closest("[data-remove-target]")

  target!.remove()
}

export function buildInputSortable(element: HTMLElement): void {
  Sortable.create(element, {
    animation: 50,
    handle: "[data-role~='sortable-handle']"
  })
}

export function render(): void {
  const elements = Array.from(document.querySelectorAll("[data-role='num-player-slider']")) as noUiSlider.Instance[]

  elements.forEach(element => setSlider(element))
}

export async function setSlider(element: noUiSlider.Instance): Promise<void> {
  if (!element) return

  if (element.dataset.initialised === "true") destroySlider(element)

  let startMin = 1
  let startMax = 12

  if (element.dataset.minPlayers) startMin = parseInt(element.dataset.minPlayers)
  if (element.dataset.maxPlayers) startMax = parseInt(element.dataset.maxPlayers)

  if (element.dataset.type == "post" && !(element.dataset.minPlayers || element.dataset.maxPlayers)) {
    startMin = 0
    startMax = 0
  }

  await create(element, startMin, startMax)

  if (element.dataset.type == "post") element.noUiSlider.on("set", postOnSliderUpdate)
  if (element.dataset.type == "filter") element.noUiSlider.on("set", filterOnSliderUpdate)

  element.dataset.initialised = "true"
}

export async function create(element: noUiSlider.Instance, startMin: number, startMax: number): Promise<void> {
  const noUiSlider = await import("nouislider")

  noUiSlider.create(element, {
    start: [startMin, startMax],
    connect: true,
    orientation: "horizontal",
    range: {
      "min": 1,
      "max": 12
    },
    step: 1,
    pips: {
      mode: "steps"
    },
    behaviour: "tap-drag"
  })
}

export function destroy(): void {
  const elements = Array.from(document.querySelectorAll("[data-role='num-player-slider']")) as noUiSlider.Instance[]

  elements.forEach(element => {
    if (!element.noUiSlider) return

    destroySlider(element)
  })
}

function postOnSliderUpdate(values: any[], handle: number): void {
  let element

  if (handle == 0) {
    element = document.getElementById("post_min_players") as HTMLFormElement
    const maxElement = document.getElementById("post_max_players") as HTMLFormElement

    if (maxElement.value == 0) maxElement.value = 1
  }

  if (handle == 1) {
    element = document.getElementById("post_max_players") as HTMLFormElement
    const minElement = document.getElementById("post_min_players") as HTMLFormElement

    if (minElement.value == 0) minElement.value = 1
  }

  element!.value = Math.round(values[handle])

  const warningElement = document.querySelector("[data-role='vanish-on-slider-update']") as HTMLElement

  if (warningElement && !warningElement.dataset.hidden) {
    warningElement.style.display = "none"
    warningElement.dataset.hidden = "true"
  }
}

function filterOnSliderUpdate(values: number[]): void {
  values = values.map(v => Math.round(v))

  const element = document.querySelector("[data-filter-type='players']") as HTMLElement

  if (values[0] == 1 && values[1] == 12) {
    element.dataset.value = ""
    return
  }

  element.dataset.value = `${values[0]}-${values[1]}`
}

function destroySlider(element: noUiSlider.Instance): void {
  element.noUiSlider.destroy()
  element.dataset.initialised = "false"
}

import noUiSlider from "nouislider/distribute/nouislider.min"

export function render() {
  const elements = document.querySelectorAll("[data-role='num-player-slider']")
  elements.forEach(function(element) {
    if (!element) return
    if (element.dataset.initialised) {
      destroySlider(element)
    }
    let startMin = 1
    let startMax = 12
    if (element.dataset.minPlayers) {
      startMin = element.dataset.minPlayers
    }
    if (element.dataset.maxPlayers) {
      startMax = element.dataset.maxPlayers
    }
    if (element.dataset.type == "post" && !(element.dataset.minPlayers || element.dataset.maxPlayers)) {
      startMin, startMax = 0, 0
    }

    create(element, startMin, startMax)

    if (element.dataset.type == "post") element.noUiSlider.on("set", postOnSliderUpdate)
    if (element.dataset.type == "filter") element.noUiSlider.on("set", filterOnSliderUpdate)

    element.dataset.initialised = true
  })
}

export function create(element, startMin, startMax) {
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

export function destroy() {
  const sliders = document.querySelectorAll("[data-role='num-player-slider']")

  sliders.forEach(slider => {
    slider.noUiSlider.destroy()
    slider.dataset.initialised = false
  })
}

function postOnSliderUpdate(values, handle) {
  let element
  if (handle == 0) {
    element = document.getElementById("post_min_players")
    if (document.getElementById("post_max_players").value == 0) {
      document.getElementById("post_max_players").value = 1
    }
  }
  if (handle == 1) {
    element = document.getElementById("post_max_players")
    if (document.getElementById("post_min_players").value == 0) {
      document.getElementById("post_min_players").value = 1
    }
  }
  element.value = Math.round(values[handle])

  const warningElem = document.querySelector("[data-role='vanish-on-slider-update']")
  if (warningElem && !warningElem.dataset.hidden) {
    warningElem.style.display = "none"
    warningElem.dataset.hidden = true
  }
}

function filterOnSliderUpdate(values) {
  values = values.map(v => Math.round(v))
  const element = document.querySelector("[data-filter-type='players']")
  if (values[0] == 1 && values[1] == 12) {
    element.dataset.value = ""
    return
  }
  element.dataset.value = `${ values[0] }-${ values[1] }`
}

function destroySlider(element) {
  while (element.firstChild) {
    element.removeChild(element.lastChild)
  }
}

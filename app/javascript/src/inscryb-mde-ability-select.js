export function insertAbilityIconSelect(element, mde, codemirror) {
  const button = mde.gui.toolbar.querySelector(".fa-ability-icon").closest("button")

  button.classList.toggle("dropdown-open")

  if (!button.classList.contains("dropdown-open")) {
    button.querySelector(".editor-dropdown").remove()
    return
  }

  const abilities = JSON.parse(element.dataset.abilities)

  const dropdownElement = document.createElement("div")
  dropdownElement.classList.add("editor-dropdown")

  const abilitiesElement = document.createElement("div")

  const input = document.createElement("input")
  input.type = "text"
  input.classList.add("form-input", "bg-darker", "mb-1/8")
  input.placeholder = "Search by name..."

  input.addEventListener("click", event => {
    event.stopPropagation()
    event.preventDefault()

    input.focus()
  })

  input.addEventListener("input", event => onInput(event, abilitiesElement, codemirror, abilities))

  dropdownElement.append(input)
  dropdownElement.append(abilitiesElement)

  buildItems(abilitiesElement, codemirror, abilities)

  button.append(dropdownElement)

  input.focus()
}

function buildItems(abilitiesElement, codemirror, abilities) {
  if (!Object.keys(abilities).length) {
    abilitiesElement.innerHTML = "<div class=\"p-1/8 pt-0\">No results found</div>"
    return
  }

  abilitiesElement.innerHTML = ""

  Object.entries(abilities).forEach(([key, url]) => {
    const abilityElement = document.createElement("div")
    abilityElement.classList.add("editor-dropdown__item", "editor-dropdown__item--icon")
    abilityElement.innerText = key

    const iconElement = document.createElement("img")
    iconElement.loading = "lazy"
    iconElement.src = url

    abilityElement.prepend(iconElement)

    abilityElement.addEventListener("click", () => {
      codemirror.replaceSelection(`[ability ${key}]`)
    })

    abilitiesElement.append(abilityElement)
  })
}

function onInput(event, abilitiesElement, codemirror, abilities) {
  let filteredAbilities = {}
  if (!event.target.value) {
    filteredAbilities = abilities
  } else {
    for (const key in abilities) {
      if (key.toLowerCase().includes(event.target.value.toLowerCase())) filteredAbilities[key] = abilities[key]
    }
  }

  buildItems(abilitiesElement, codemirror, filteredAbilities)
}

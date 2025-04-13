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

  positionDropdown(dropdownElement)

  input.focus()
}

function buildItems(abilitiesElement, codemirror, abilities) {
  if (!abilities.length) {
    abilitiesElement.innerHTML = "<div class=\"p-1/8 pt-0\">No results found</div>"
    return
  }

  abilitiesElement.innerHTML = ""

  abilities.forEach(({ name, url, terms }) => {
    const abilityElement = document.createElement("div")
    abilityElement.classList.add("editor-dropdown__item", "editor-dropdown__item--icon")
    abilityElement.innerHTML = `
      <div>${name} <div class="text-small text-dark">${terms.join(", ")}</div></div>
    `

    const iconElement = document.createElement("img")
    iconElement.loading = "lazy"
    iconElement.src = url

    abilityElement.prepend(iconElement)

    abilityElement.addEventListener("click", () => {
      codemirror.replaceSelection(`[ability ${name}]`)
    })

    abilitiesElement.append(abilityElement)
  })
}

function onInput(event, abilitiesElement, codemirror, abilities) {
  const query = event.target.value.toLowerCase()

  let filteredAbilities = []

  if (!event.target.value) {
    filteredAbilities = abilities
  } else {
    for (let i = 0; i < abilities.length; i++) {
      const { name, terms } = abilities[i]

      if (name.toLowerCase().includes(query) || terms.some(term => term.toLowerCase().includes(query))) {
        filteredAbilities.push(abilities[i])
      }
    }
  }

  buildItems(abilitiesElement, codemirror, filteredAbilities)
}

function positionDropdown(element) {
  const { left } = element.getBoundingClientRect()
  const offset = 20

  if (left - 10 < 0) element.style.right = `${left - offset}px`
}

import { Decoration, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view"

/**
 * @typedef CodeAction
 * @property {number} position
 * @property {string} label
 * @property {Function} run
 */

/**
 * @typedef {(update: ViewUpdate) => CodeAction[]} CodeActionProvider
 */

class CodeActionLightBulbWidget extends WidgetType {
  constructor(actions) {
    super()

    this.actions = actions
  }

  toDOM() {
    const container = document.createElement("span")
    container.className = "button code-actions-lightbulb"
    container.textContent = "💡"

    const dropdown = document.createElement("select")
    dropdown.className = "code-actions-lightbulb__dropdown"
    container.appendChild(dropdown)

    const blankOption = document.createElement("option")
    blankOption.style.display = "none"
    dropdown.appendChild(blankOption)

    for (let actionIndex = 0; actionIndex < this.actions.length; actionIndex++) {
      const action = this.actions[actionIndex]

      const option = document.createElement("option")
      option.value = actionIndex.toString()
      option.text = action.label
      dropdown.appendChild(option)
    }

    container.addEventListener("click", () => dropdown.click())
    dropdown.addEventListener("change", (event) => {
      const actionIndex = parseInt(event.target.value, 10)
      const action = this.actions[actionIndex]

      action.run()
    })

    return container
  }
}

function createLightBulbDecoration(position, actions) {
  return Decoration.widget({
    widget: new CodeActionLightBulbWidget(actions),
    side: -1, // -1 for left, 1 for right
    block: false
  }).range(position)
}

/**
 * @param {CodeActionProvider[]} providers
 */
export function codeActions(providers) {
  return ViewPlugin.fromClass(class {
    constructor(_view) {
      this.decorations = Decoration.none
    }

    /**
     * @param {ViewUpdate} update
     */
    update(update) {
      if (!(update.docChanged || update.selectionSet || update.viewportChanged)) return

      this.decorations = Decoration.none

      const actions = providers
        .map((provider) => provider(update) ?? [])
        .flat()

      if (!actions.length) return

      const { from } = update.state.selection.main
      const decorationPosition = actions.reduce((position, action) => Math.min(action.position ?? Infinity, position), from)

      this.decorations = Decoration.set([
        createLightBulbDecoration(decorationPosition, actions)
      ])
    }
  }, {
    decorations: (extension) => extension.decorations
  })
}

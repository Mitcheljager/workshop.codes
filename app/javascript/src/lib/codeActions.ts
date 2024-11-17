import type { Range } from "@codemirror/state"
import { Decoration, ViewPlugin, WidgetType, type ViewUpdate } from "@codemirror/view"

export interface CodeAction {
  position: number,
  label: string,
  run: () => void
}

export type CodeActionProvider = (update: ViewUpdate) => CodeAction[]

class CodeActionLightBulbWidget extends WidgetType {
  actions: CodeAction[]

  constructor(actions: CodeAction[]) {
    super()

    this.actions = actions
  }

  toDOM(): HTMLElement {
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
      const target = event.target as HTMLSelectElement
      const actionIndex = parseInt(target.value, 10)
      const action = this.actions[actionIndex]

      action.run()
    })

    return container
  }
}

function createLightBulbDecoration(position: number, actions: CodeAction[]): Range<Decoration> {
  return Decoration.widget({
    widget: new CodeActionLightBulbWidget(actions),
    side: -1, // -1 for left, 1 for right
    block: false
  }).range(position)
}

export function codeActions(providers: CodeActionProvider[]): ViewPlugin<any> {
  return ViewPlugin.fromClass(class {
    decorations = Decoration.none

    constructor(_view: any) {
      this.decorations = Decoration.none
    }

    update(update: ViewUpdate): void {
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

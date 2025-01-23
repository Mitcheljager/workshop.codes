import * as ActiveStorage from "@rails/activestorage"

ActiveStorage.start()

import { initializeSvelteComponent } from "@src/svelte-component"
import Alerts from "@src/components/Alerts.svelte"
import Dropzone from "@src/components/form/Dropzone.svelte"
import ControlsForm from "@src/components/form/Controls.svelte"
import SnippetForm from "@src/components/form/Snippet.svelte"
import LimitedCheckboxes from "@src/components/form/LimitedCheckboxes.svelte"
import TagsForm from "@src/components/form/Tags.svelte"
import DerivativesForm from "@src/components/form/Derivatives.svelte"
import Notifications from "@src/components/Notifications.svelte"
import Ollie from "@src/components/Ollie.svelte"
import { LinkedChart, LinkedLabel } from "svelte-tiny-linked-charts"

import * as applyCustomCss from "@src/apply-custom-css"
import * as blocks from "@src/blocks"
import * as chart from "@src/chart"
import * as checkboxSelectAll from "@src/checkbox-select-all"
import * as favorite from "@src/favorite"
import * as getPostAnalytics from "@src/get-post-analytics"
import * as getUserAnalytics from "@src/get-user-analytics"
import * as ide from "@src/ide"
import * as imagePreview from "@src/image-preview"
import * as inscrybMde from "@src/inscryb-mde"
import * as linkedInput from "@src/linked-input"
import * as navigateOnChange from "@src/navigate-on-change"
import * as setCssVariable from "@src/set-css-variable"
import * as revealByCheckbox from "@src/reveal-by-checkbox"
import * as revealOnDifference from "@src/reveal-on-difference"

document.addEventListener("turbolinks:load", () => {
  const svelteComponents = {
    Alerts: Alerts,
    Dropzone: Dropzone,
    ControlsForm: ControlsForm,
    SnippetForm: SnippetForm,
    LimitedCheckboxes: LimitedCheckboxes,
    TagsForm: TagsForm,
    DerivativesForm: DerivativesForm,
    Notifications: Notifications,
    LinkedChart: LinkedChart,
    LinkedLabel: LinkedLabel,
    Ollie: Ollie
  }

  Object.entries(svelteComponents).forEach(([name, component]) => initializeSvelteComponent(name, component))

  ide.bind()
  applyCustomCss.bind()
  blocks.bind()
  checkboxSelectAll.bind()
  favorite.bind()
  getPostAnalytics.bind()
  getUserAnalytics.bind()
  setCssVariable.bind()
  linkedInput.bind()
  imagePreview.bind()
  navigateOnChange.bind()
  revealByCheckbox.bind()
  revealOnDifference.bind()

  chart.render()
  inscrybMde.render()
})

document.addEventListener("turbolinks:before-cache", () => {
  inscrybMde.destroy()

  const svelteComponents = Array.from(document.querySelectorAll("[data-svelte-component]")) as HTMLElement[]
  svelteComponents.forEach(element => element.dataset.initialized = "null")
})

document.addEventListener("turbolinks:click", () => {
  const svelteComponents = Array.from(document.querySelectorAll("[data-svelte-component]")) as HTMLElement[]
  svelteComponents.forEach(element => element.dataset.initialized = "null")
})

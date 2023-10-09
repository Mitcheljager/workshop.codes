import * as ActiveStorage from "@rails/activestorage"

ActiveStorage.start()

import WebpackerSvelte from "webpacker-svelte"
import Alerts from "../src/components/Alerts.svelte"
import Dropzone from "../src/components/form/Dropzone.svelte"
import ControlsForm from "../src/components/form/Controls.svelte"
import SnippetForm from "../src/components/form/Snippet.svelte"
import LimitedCheckboxes from "../src/components/form/LimitedCheckboxes.svelte"
import TagsForm from "../src/components/form/Tags.svelte"
import DerivativesForm from "../src/components/form/Derivatives.svelte"
import Notifications from "../src/components/Notifications.svelte"
import { LinkedChart, LinkedLabel } from "svelte-tiny-linked-charts"

WebpackerSvelte.setup({ Alerts, Dropzone, ControlsForm, SnippetForm, LimitedCheckboxes, TagsForm, DerivativesForm, Notifications, LinkedChart, LinkedLabel })

import * as applyCustomCss from "../src/apply-custom-css"
import * as blocks from "../src/blocks"
import * as chart from "../src/chart"
import * as checkboxSelectAll from "../src/checkbox-select-all"
import * as favorite from "../src/favorite"
import * as getPostAnalytics from "../src/get-post-analytics"
import * as getUserAnalytics from "../src/get-user-analytics"
import * as ide from "../src/ide"
import * as inscrybMde from "../src/inscryb-mde"
import * as linkedInput from "../src/linked-input"
import * as setCssVariable from "../src/set-css-variable"

document.addEventListener("turbolinks:load", function() {
  ide.bind()
  applyCustomCss.bind()
  blocks.bind()
  checkboxSelectAll.bind()
  favorite.bind()
  getPostAnalytics.bind()
  getUserAnalytics.bind()
  setCssVariable.bind()
  linkedInput.bind()

  chart.render()
  inscrybMde.render()
})

document.addEventListener("turbolinks:before-cache", function() {
  inscrybMde.destroy()

  const svelteComponents = document.querySelectorAll("[data-svelte-component]")
  svelteComponents.forEach(element => element.dataset.initialized = null)
})

document.addEventListener("turbolinks:click", () => {
  const svelteComponents = document.querySelectorAll("[data-svelte-component]")
  svelteComponents.forEach(element => element.dataset.initialized = null)
})

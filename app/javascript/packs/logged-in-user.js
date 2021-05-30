import * as ActiveStorage from "@rails/activestorage"

ActiveStorage.start()

import WebpackerSvelte from "webpacker-svelte"
import Dropzone from "../src/components/form/Dropzone.svelte"
import ControlsForm from "../src/components/form/Controls.svelte"
import SnippetForm from "../src/components/form/Snippet.svelte"

WebpackerSvelte.setup({ Dropzone, ControlsForm, SnippetForm })

import * as applyCustomCss from "../src/apply-custom-css"
import * as blocks from "../src/blocks"
import * as chart from "../src/chart"
import * as checkboxSelectAll from "../src/checkbox-select-all"
import * as getNotifications from "../src/get-notifications"
import * as getPostAnalytics from "../src/get-post-analytics"
import * as getUserAnalytics from "../src/get-user-analytics"
import * as ide from "../src/ide"
import * as inscrybMde from "../src/inscryb-mde"
import * as setCssVariable from "../src/set-css-variable"

document.addEventListener("turbolinks:load", function() {
  ide.bind()
  applyCustomCss.bind()
  blocks.bind()
  checkboxSelectAll.bind()
  getNotifications.bind()
  getPostAnalytics.bind()
  getUserAnalytics.bind()
  setCssVariable.bind()

  chart.render()
  inscrybMde.render()
})

document.addEventListener("turbolinks:before-cache", function() {
  inscrybMde.destroy()
})

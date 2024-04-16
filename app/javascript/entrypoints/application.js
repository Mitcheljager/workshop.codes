import "@src/remove-and-add-event-listener"

import Rails from "@rails/ujs"
import Turbolinks from "turbolinks"
import TurbolinksPrefetch from "@src/turbolinks-prefetch"

if (!window._rails_loaded) Rails.start()
Turbolinks.start()
TurbolinksPrefetch.start()

import * as carousel from "@src/carousel"
import * as carouselCards from "@src/carousel-cards"
import * as copy from "@src/copy"
import * as differenceViewer from "@src/difference-viewer"
import * as disableFormBySelect from "@src/disable-form-by-select"
import * as dismissParent from "@src/dismiss-parent"
import * as dropdown from "@src/dropdown"
import * as dynamicMaxHeight from "@src/dynamic-max-height"
import * as filter from "@src/filter"
import * as gallery from "@src/gallery"
import * as getKoFiValue from "@src/get-ko-fi-value"
import * as getPartial from "@src/get-partial"
import * as getReportsForm from "@src/get-reports-form"
import * as getSnippet from "@src/get-snippet"
import * as getVerifiedUsers from "@src/get-verified-users"
import * as imagePreview from "@src/image-preview"
import * as infiniteScroll from "@src/infinite-scroll"
import * as lazyVideo from "@src/lazy-video"
import * as microlight from "@src/microlight"
import * as modal from "@src/modal"
import * as navigation from "@src/navigation"
import * as numPlayersSlider from "@src/num-players-slider"
import * as ollieForm from "@src/ollie-form"
import * as revealByCheckbox from "@src/reveal-by-checkbox"
import * as revealBySelect from "@src/reveal-by-select"
import * as revealOnDifference from "@src/reveal-on-difference"
import * as scrollIndicator from "@src/scroll-indicator"
import * as scrollIntoViewOnLoad from "@src/scroll-into-view-on-load"
import * as sticky from "@src/sticky"
import * as tabs from "@src/tabs"
import * as timeago from "@src/timeago"
import * as toggleContent from "@src/toggle-content"
import * as wikiSearch from "@src/wiki/search"

document.addEventListener("turbolinks:load", () => {
  copy.bind()
  disableFormBySelect.bind()
  dismissParent.bind()
  dropdown.bind()
  dynamicMaxHeight.bind()
  filter.bind()
  gallery.bind()
  getPartial.bind()
  getReportsForm.bind()
  getSnippet.bind()
  getVerifiedUsers.bind()
  imagePreview.bind()
  infiniteScroll.bind()
  lazyVideo.bind()
  modal.bind()
  navigation.bind()
  ollieForm.bind()
  revealByCheckbox.bind()
  revealBySelect.bind()
  revealOnDifference.bind()
  scrollIndicator.bind()
  sticky.bind()
  tabs.bind()
  toggleContent.bind()
  wikiSearch.bind()

  microlight.reset()

  carousel.render()
  carouselCards.render()
  differenceViewer.render()
  getKoFiValue.render()
  numPlayersSlider.render()

  timeago.initialize()
  scrollIntoViewOnLoad.initialize()
})

document.addEventListener("turbolinks:before-cache", () => {
  carouselCards.destroy()
  dismissParent.destroy()
  numPlayersSlider.destroy()
  sticky.destroy()
  dynamicMaxHeight.destroy()
})

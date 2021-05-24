import { curveStep } from  "d3"
import * as MG from "metrics-graphics"

export function render() {
  const charts = document.querySelectorAll("[data-role='chart']")

  charts.forEach(element => {
    if (element.dataset.data != null) createChart(element, JSON.parse(element.dataset.data))
  })
}

export default function createChart(element, data, dateformat = "%Y-%m-%d") {
  element.innerHTML = ""
  
  let processedMarkers = []
  if (element.dataset.markers != null) {
    const markers = JSON.parse(element.dataset.markers)
    processedMarkers = markers.map(marker => {
      return {
        "date": new Date(marker[2]),
        "label": marker[1]
      }
    })
  }

  MG.data_graphic({
    data: MG.convert.date(data, "date", dateformat),
    markers: processedMarkers,
    full_width: true,
    height: element.dataset.height == null ? 300 : parseInt(element.dataset.height),
    target: element,
    transition_on_update: false,
    area: true,
    x_accessor: "date",
    y_accessor: "value",
    brush: "x",
    top: 15,
    right: 0,
    bottom: 40,
    left: 40,
    interpolate: curveStep,
    linked: true
  })
}

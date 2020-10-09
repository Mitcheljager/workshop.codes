//= require d3/build/d3.min.js
//= require metrics-graphics/dist/metricsgraphics.min.js

document.addEventListener("turbolinks:load", function() {
  const charts = document.querySelectorAll("[data-role='chart']")

  charts.forEach(element => {
    if (element.dataset.data != null) createChart(element, JSON.parse(element.dataset.data))
  })
})

function createChart(element, data, dateformat = "%Y-%m-%d") {
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
    area: true,
    x_accessor: "date",
    y_accessor: "value",
    brush: "x",
    top: 15,
    right: 0,
    bottom: 40,
    left: 40,
    interpolate: d3.curveStep
  })
}

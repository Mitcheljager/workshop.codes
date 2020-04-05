//= require Chart.min

(() => {
  const charts = document.querySelectorAll("[data-role='chart']")

  charts.forEach(element => {
    createChart(element)
  })
})()

function createChart(element) {
  const ctx = element.getContext("2d")
  const gradient = ctx.createLinearGradient(0, 0, 0, 400)
  gradient.addColorStop(0, "rgba(240, 100, 20, 0.25)")
  gradient.addColorStop(1, "rgba(240, 100, 20, 0)")

  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: JSON.parse(element.dataset.labels),
      datasets: [{
        fillColor: gradient,
        label: "",
        data: JSON.parse(element.dataset.values),
        backgroundColor: gradient,
        borderColor: "rgba(240, 100, 20, 1)",
        borderWidth: 1,
        pointBackgroundColor: "rgba(240, 100, 20, 1)",
        pointRadius: JSON.parse(element.dataset.values).map(p => p == 0 ? 0 : 3)
      }]
    },
    options: {
      height: 250,
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: false
      },
      scales: {
        yAxes: [{
          gridLines: {
            drawBorder: false,
            color: "rgba(255, 255, 255, .075)"
          },
          ticks: {
            maxTicksLimit: 4,
            userCallback: (label, index, labels) => { if (Math.floor(label) === label) return label },
            userCallback: (label, index, labels) => { return label.toLocaleString() },
            fontColor: "#8f94a5",
            fontSize: 12
          }
        }],
        xAxes: [{
          barThickness: "flex",
          barMaxThickness: 2,
          gridLines: {
            drawBorder: false,
            color: "rgba(255, 255, 255, 0)"
          },
          ticks: {
            maxRotation: 0,
            drawBorder: false,
            maxTicksLimit: 4,
            fontColor: "#8f94a5",
            fontSize: 12
          }
        }]
      }
    }
  })
}

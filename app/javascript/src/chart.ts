export function render(): void {
  const charts = Array.from(document.querySelectorAll<HTMLElement>("[data-role='chart']"))

  charts.forEach(element => {
    if (element.dataset.data != null) createChart(element, JSON.parse(element.dataset.data))
  })
}

export default async function createChart(element: HTMLElement, data: any, dateformat = "%Y-%m-%d"): Promise<void> {
  const { curveStep } = await import("d3")
  // @ts-ignore
  const MG = await import("metrics-graphics")

  element.innerHTML = ""

  let processedMarkers = []
  if (element.dataset.markers != null) {
    const markers = JSON.parse(element.dataset.markers)
    processedMarkers = markers.map((marker: string[]): { date: Date; label: string; } => ({
      "date": new Date(marker[2]),
      "label": marker[1]
    }))
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
    linked: true,
    //@ts-ignore
    x_rollover_format: ({ label, date }) => {
      const dateFormat = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short", year: "numeric" })
      return (label || dateFormat.format(date)) + " - "
    }
  })
}

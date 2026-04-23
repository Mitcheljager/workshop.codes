import { initializeSvelteComponent } from "./svelte-component"
import { LinkedChart } from "svelte-tiny-linked-charts"

export function render(): void {
  get()
}

async function get(): Promise<void> {
  const chart = document.querySelector<HTMLElement>("[data-svelte-component='StatusChart']")
  const averageElement = document.querySelector<HTMLElement>("[data-role='status-average']")!

  if (!chart) return

  try {
    const data = await fetch("https://status.workshop.codes")
    const json = await data.json()
    const props = JSON.parse(chart.dataset.svelteProps!)

    props.labels = json.map((i: any) => i.datetime)
    props.values = json.map((i: any) => Math.round(i.response_time * 1000))
    chart.dataset.svelteProps = JSON.stringify(props)

    const averageTotal = props.values.reduce((t: number, c: number) => t + c, 0) / props.values.length
    const averageLastCount = Math.min(100, props.values.length)
    const averageLast = props.values.slice(-averageLastCount).reduce((t: number, c: number) => t + c, 0) / averageLastCount
    averageElement.innerText = `Total average: ${Math.round(averageTotal)}ms - Last 100 average: ${Math.round(averageLast)}ms`

    initializeSvelteComponent("StatusChart", LinkedChart)
  } catch (error: any) {
    chart.innerHTML = error
  }
}

import { initializeSvelteComponent } from "./svelte-component"
import { LinkedChart } from "svelte-tiny-linked-charts"

export function render(): void {
  get()
}

async function get(): Promise<void> {
  const chart = document.querySelector<HTMLElement>("[data-svelte-component='StatusChart']")

  if (!chart) return

  try {
    const data = await fetch("https://status.workshop.codes")
    const json = await data.json()
    const props = JSON.parse(chart.dataset.svelteProps!)

    props.labels = json.map((i: any) => i.datetime)
    props.values = json.map((i: any) => i.response_time)
    chart.dataset.svelteProps = JSON.stringify(props)

    initializeSvelteComponent("StatusChart", LinkedChart)
  } catch (error: any) {
    chart.innerHTML = error
  }
}

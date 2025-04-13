<script lang="ts">
  import Alert from "@components/Alert.svelte"
  import { slide } from "svelte/transition"
  import { onMount } from "svelte"

  interface Props { initialAlerts?: string }
  interface AlertEntry { text: string, type: string, key?: string }

  const { initialAlerts = "" }: Props = $props()

  let alerts: AlertEntry[] = $state([])

  onMount(() => {
    if (initialAlerts) parseInitialAlerts()
  })

  /** When alerts are passed from Rails they are passed as a string
   * that is an array of arrays shaped like [[type, text], [type, text]] */
  function parseInitialAlerts(): void {
    JSON.parse(initialAlerts).forEach(([type, text]: [string, string]) => {
      add({ text, type: `alert--${type}` })
    })
  }

  function add(alert: AlertEntry) {
    const key = Math.random().toString()
    alerts = [...alerts, { ...alert, key }]
  }

  function close(key: string) {
    alerts = alerts.filter((a) => a.key !== key)
  }
</script>

<svelte:window onalert={({ detail }) => add(detail)} />

<div class="alerts">
  {#each alerts as { text, type, key } (key)}
    <div transition:slide={{ duration: 200 }}>
      <Alert {text} {type}  onclose={() => close(key!)} />
    </div>
  {/each}
</div>

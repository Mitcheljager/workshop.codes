<script>
  import Alert from "@components/Alert.svelte"
  import { slide } from "svelte/transition"

  // When alerts are passed from rails they are passed as a string
  // that is an array of arrays shaped like [[type, text], [type, text]]
  export let initialAlerts = ""

  let alerts = []

  $: if (initialAlerts) JSON.parse(initialAlerts)?.forEach(([type, text]) => add({ text, type: `alert--${type}` }))

  function add(alert) {
    alerts = [...alerts, { ...alert, key: Math.random() }]
  }

  function close(key) {
    alerts = alerts.filter((a) => a.key !== key)
  }
</script>

<svelte:window on:alert={({ detail }) => add(detail)} />

<div class="alerts">
  {#each alerts as { text, type, key } (key)}
    <div transition:slide={{ duration: 200 }}>
      <Alert {text} {type} {key} on:close={({ detail }) => close(detail)} />
    </div>
  {/each}
</div>

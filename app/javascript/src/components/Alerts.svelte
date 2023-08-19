<script>
  import { slide } from "svelte/transition"

  // When alerts are passed from rails they are passed as a string
  // that is an array of arrays shaped like [[type, text], [type, text]]
  export let initialAlerts = ""

  const timeout = 3000

  let alerts = []

  $: if (initialAlerts) JSON.parse(initialAlerts)?.forEach(([type, text]) => add({ text, type: `alert--${ type }` }))

  function add(alert) {
    alerts = [...alerts, { ...alert, key: Math.random() }]
  }

  function close(index) {
    alerts = alerts.filter((_, i) => i !== index)
  }
</script>

<svelte:window on:alert={({ detail }) => add(detail)} />

<div class="alerts">
  {#each alerts as { text, type, key }, i (key)}
    <div transition:slide={{ duration: 200 }}>
      <div class="alert {type} static">
        <p class="m-0">{text}</p>

        <button class="button p-0 pl-1/16 pr-1/16 text-pure-white" on:click={() => close(i)}>✕</button>
      </div>
    </div>
  {/each}
</div>

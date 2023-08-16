<script>
  import { slide } from "svelte/transition"

  let alerts = []

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
    <div class="alerts__alert {type} static" transition:slide={{ duration: 200 }}>
      <p class="m-0">{text}</p>

      <button class="button p-0 pl-1/16 pr-1/16 text-pure-white" on:click={() => close(i)}>✕</button>
    </div>
  {/each}
</div>

<script lang="ts">
  import { onMount } from "svelte"

  interface Props { text: string, type: string, onclose: () => void }

  const { text = "", type = "", onclose = () => null }: Props = $props()

  const timer = 5000

  let timeout

  onMount(() => {
    setTimeout(onclose, timer)

    return () => { if (timeout) clearTimeout(timeout) }
  })
</script>

<div class="alert {type} static" aria-atomic="true" aria-live={type === "error" ? "assertive" : "polite"}>
  <p class="m-0">{text}</p>

  <button class="button p-0 pl-1/16 pr-1/16 text-white" onclick={() => onclose()} aria-label="Close alert">✕</button>

  <div class="alert__timer" style="--timer: {timer}ms"></div>
</div>

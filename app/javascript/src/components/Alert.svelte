<script lang="ts">
  import { onMount } from "svelte"

  interface Props { text: string, type: string, onclose: () => void }

  const { text = "", type = "", onclose = () => null }: Props = $props()

  const timer = 5000

  let timeout: ReturnType<typeof setTimeout> | null = $state(null)
  let playTime: number = $state(0)
  let remainingTime: number = $state(timer)
  let paused: boolean = $state(true)

  onMount(() => {
    play()

    return () => { if (timeout) clearTimeout(timeout) }
  })

  function pause(): void {
    paused = true
    remainingTime = remainingTime - (new Date().getTime() - playTime)

    if (timeout) clearTimeout(timeout)
  }

  function play(): void {
    paused = false
    playTime = new Date().getTime()
    timeout = setTimeout(onclose, remainingTime)
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="alert {type} static" class:alert--paused={paused} aria-atomic="true" aria-live={type === "error" ? "assertive" : "polite"} onmouseenter={pause} onmouseleave={play}>
  <p class="m-0">{text}</p>

  <button class="button p-0 pl-1/16 pr-1/16 text-white" onclick={() => onclose()} aria-label="Close alert">✕</button>

  <div class="alert__timer" style="--timer: {timer}ms"></div>
</div>

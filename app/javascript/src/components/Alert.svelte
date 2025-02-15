<script>
  import { onMount, onDestroy, createEventDispatcher } from "svelte"

  export let text = ""
  export let type = ""
  export let key = ""

  const timer = 5000
  const dispatch = createEventDispatcher()

  let timeout

  onMount(() => setTimeout(close, timer))
  onDestroy(() => { if (timeout) clearTimeout(timeout) })

  function close() {
    dispatch("close", key)
  }
</script>

<div class="alert {type} static">
  <p class="m-0">{text}</p>

  <button class="button p-0 pl-1/16 pr-1/16 text-white" on:click={close}>✕</button>

  <div class="alert__timer" style="--timer: {timer}ms"></div>
</div>

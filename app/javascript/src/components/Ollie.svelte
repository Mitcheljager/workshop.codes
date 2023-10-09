<script>
  import { Confetti } from "svelte-confetti"

  export let chance = 10
  export let image = ""

  let active = false

  function maybeShow() {
    if (active) return
    const random = Math.random() * 100

    if (random > chance) return

    active = true
    setTimeout(() => active = false, 2000)
  }
</script>

<svelte:window on:favorite|stopImmediatePropagation={maybeShow} />

<div>
  {#if active}
    <div class="ollie-overlay">
      <img src={image} alt="" width="200" />

      <Confetti x={[5, 0]} y={[5, 0]} amount="100" size="15" cone colorArray={["#f06414"]} />
    </div>
  {/if}
</div>

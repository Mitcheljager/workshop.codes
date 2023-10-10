<script>
  import { Confetti } from "svelte-confetti"

  export let chance = 10
  export let imageFlyBy = ""
  export let imageHeart = ""

  let active = false
  let type = 1

  function maybeShow() {
    if (active) return
    const random = Math.random() * 100

    if (random > chance) return

    // Select the type of animation, 1 or 2
    type = Math.ceil(Math.random() * 2)

    active = true
    setTimeout(() => active = false, 2000)
  }
</script>

<svelte:window on:favorite|stopImmediatePropagation={maybeShow} />

<div>
  {#if active}
    <div class="ollie-overlay">
      {#if type === 1}
        <div class="ollie-fly-by">
          <img src={imageFlyBy} alt="" width="200" />

          <Confetti x={[5, 0]} y={[5, 0]} amount="100" size="15" cone colorArray={["#f06414"]} />
        </div>
      {/if}

      {#if type === 2}
        <div class="ollie-heart">
          <img src={imageHeart} alt="" width="200" />
        </div>
      {/if}
    </div>
  {/if}
</div>

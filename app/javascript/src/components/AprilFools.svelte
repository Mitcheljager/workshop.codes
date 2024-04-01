<script>
  import { fly } from "svelte/transition"
  import { onMount } from "svelte"

  export let images = []

  let active = true

  $: randomImage = images[Math.floor(Math.random() * images.length)]
</script>

{#if active}
  <div class="april-fools" out:fly={{ y: 100, duration: 500 }}>
    <img class="april-fools__image" src={randomImage} alt="">

    <div class="april-fools__backdrop" />

    <button class="april-fools__close" on:click={() => active = false}>X</button>
  </div>
{/if}

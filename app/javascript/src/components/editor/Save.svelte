<script>
  import FetchRails from "../../fetch-rails"
  import { currentProject, items } from "../../stores/editor"
  import { Confetti } from "svelte-confetti"

  let loading = false
  let confettiActive = false

  function save() {
    loading = true

    new FetchRails(`/projects/${ $currentProject.uuid }`, { project: { content: JSON.stringify($items) } }).post({ method: "put" })
      .then(data => {
        if (!data) throw Error("Create failed")

        showConfetti()
      })
      .catch(error => {
        console.error(error)
        alert("Something went wrong while saving, please try again")
      })
      .finally(() => loading = false)
  }

  function showConfetti() {
    confettiActive = true
    setTimeout(() => confettiActive = false, 1000)
  }

  function keydown(event) {
    if (event.ctrlKey && event.keyCode == 83) {
      event.preventDefault()
      save()
    }
  }
</script>

<svelte:window on:keydown={keydown} />

<div class="confetti-holder">
  <button class="button" on:click={save} disabled={loading}>
    {#if loading}
      Saving...
    {:else}
      Save
    {/if}
  </button>

  {#if confettiActive}
    <div class="confetti">
      <Confetti colorArray={["var(--primary)"]} x={[-0.5, 0.5]} y={[-0.15, 0.25]} fallDistance="10px" amount="20" size="7" duration=1000 />
    </div>
  {/if}
</div>



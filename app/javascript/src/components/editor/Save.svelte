<script>
  import FetchRails from "../../fetch-rails"
  import { currentProject } from "../../stores/editor"
  import { getSaveContent } from "../../utils/editor"
  import { Confetti } from "svelte-confetti"

  let loading = false
  let confettiActive = false
  let lastSaveContent = ""

  function save() {
    loading = true

    const content = getSaveContent()

    new FetchRails(`/projects/${ $currentProject.uuid }`, { project: { content } }).post({ method: "put" })
      .then(data => {
        if (!data) throw Error("Create failed")

        lastSaveContent = content
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
    if (event.ctrlKey && !event.shiftKey && event.code === "KeyS") {
      event.preventDefault()
      save()
    }
  }

  function beforeUnload(event) {
    if (!lastSaveContent || JSON.stringify(lastSaveContent) === JSON.stringify(getSaveContent())) return

    event.preventDefault()
    return (event.returnValue = "")
  }
</script>

<svelte:window on:keydown={keydown} on:beforeunload={beforeUnload} />

<div class="relative">
  <button class="button button--square" on:click={save} disabled={loading}>
    {#if loading}
      Saving...
    {:else}
      Save
    {/if}
  </button>

  {#if confettiActive}
    <div class="confetti-holder">
      <Confetti colorArray={["var(--primary)"]} x={[-0.5, 0.5]} y={[-0.15, 0.25]} fallDistance="10px" amount="20" size="7" duration=1000 />
    </div>
  {/if}
</div>



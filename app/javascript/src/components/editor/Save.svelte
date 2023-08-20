<script>
  import FetchRails from "../../fetch-rails"
  import { currentProject, modal } from "../../stores/editor"
  import { getSaveContent } from "../../utils/editor"
  import { updateProject } from "../../utils/project"
  import { createProjectBackup } from "../../utils/projectBackups"
  import { Modal } from "../../constants/Modal"
  import { escapeable } from "../actions/escapeable"
  import { outsideClick } from "../actions/outsideClick"
  import { Confetti } from "svelte-confetti"
  import { fly } from "svelte/transition"

  let loading = false
  let confettiActive = false
  let dropdownActive = false
  let lastSaveContent = ""

  function save() {
    loading = true

    const content = getSaveContent()

    new FetchRails(`/projects/${ $currentProject.uuid }`, { project: { content } }).post({ method: "put" })
      .then(data => {
        if (!data) throw Error("Create failed")

        lastSaveContent = content
        updateProject($currentProject.uuid, { updated_at: Date.now() })

        showConfetti()
      })
      .catch(error => {
        console.error(error)
        alert("Something went wrong while saving, please try again")
      })
      .finally(() => loading = false)
  }

  async function createBackup() {
    loading = true
    await createProjectBackup($currentProject.uuid)
    loading = false
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
  <div class="button-group">
    <button class="button button--square" on:click={save} disabled={loading}>
      {#if loading}
        Saving...
      {:else}
        Save
      {/if}
    </button>

    <div class="dropdown" use:outsideClick on:outsideClick={() => dropdownActive = false}>
      <button class="button button--square pr-0 pl-0 h-100 flex align-center" on:click={() => dropdownActive = !dropdownActive}>
        <svg width="18px" height="18px" viewBox="0 0 24 24" class="m-0">
          <path d="M7.00003 8.5C6.59557 8.5 6.23093 8.74364 6.07615 9.11732C5.92137 9.49099 6.00692 9.92111 6.29292 10.2071L11.2929 15.2071C11.6834 15.5976 12.3166 15.5976 12.7071 15.2071L17.7071 10.2071C17.9931 9.92111 18.0787 9.49099 17.9239 9.11732C17.7691 8.74364 17.4045 8.5 17 8.5H7.00003Z" fill="white" />
        </svg>
      </button>

      {#if dropdownActive}
        <div transition:fly={{ duration: 150, y: 20 }} use:escapeable on:escape={() => dropdownActive = false} class="dropdown__content block w-100 p-1/4" style="width: 200px">
          <p class="mt-0 text-italic text-small text-base">
            Last saved:<br>
            {new Date($currentProject.updated_at).toLocaleString()}
          </p>

          <button class="button button--square button--small w-100" on:click={createBackup} disabled={loading}>
            {#if loading}
              Creating backup...
            {:else}
              Create backup
            {/if}
          </button>

          <button class="button button--ghost button--square button--small w-100 mt-1/8" on:click={() => modal.show(Modal.Backups)}>
            View backups
          </button>
        </div>
      {/if}
    </div>
  </div>

  {#if confettiActive}
    <div class="confetti-holder">
      <Confetti colorArray={["var(--primary)"]} x={[-0.5, 0.5]} y={[-0.15, 0.25]} fallDistance="10px" amount="20" size="7" duration=1000 />
    </div>
  {/if}
</div>

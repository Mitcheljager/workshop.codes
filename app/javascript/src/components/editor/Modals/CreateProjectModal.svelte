<script>
  import { currentProject, isSignedIn } from "../../../stores/editor"
  import { createProject, renameCurrentProject } from "../../../utils/project"
  import { createEventDispatcher } from "svelte"
  import { fade, fly } from "svelte/transition"

  const dispatch = createEventDispatcher()

  let loading
  let value
  let active = false
  let modalType = "create"

  export function showModalOfType(type, title = "") {
    modalType = type
    value = title
    active = true
  }

  async function newProject() {
    loading = true

    const data = await createProject(value)
    if (data) {
      dispatch("setUrl", data.uuid)
      active = false
    }

    loading = false
  }

  async function renameProject() {
    if (!$isSignedIn) {
      alert("You must be signed in to rename a project")
      active = false
      return
    } else if (!$currentProject) {
      alert("No project selected? This is probably a bug.")
      active = false
      return
    }

    loading = true

    const data = await renameCurrentProject(value)
    if (data) active = false

    loading = false
  }
</script>

{#if active}
  <div class="modal modal--top" transition:fade={{ duration: 100 }} data-ignore>
    <div class="modal__content p-0" transition:fly={{ y: 100, duration: 200 }}>
      {#if !$isSignedIn}
        <div class="warning warning--orange">
          You are not signed in and this is for demonstration purposes only. Any changes you make will not be saved.
        </div>
      {/if}

      {#if modalType == "create"}
        <div class="p-1/2">
          <h3 class="mb-0 mt-0">Create a new project</h3>

          <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value />

          <button class="button w-100 mt-1/4" on:click={newProject} disabled={!value || loading}>
            {#if loading}
              ...
            {:else}
              Create
            {/if}
          </button>
        </div>
      {:else if modalType == "rename"}
        <div class="p-1/2">
          <h3 class="mb-0 mt-0">Rename {$currentProject?.title || "this project"}</h3>

          <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value />

          <button class="button w-100 mt-1/4" on:click={renameProject} disabled={!value || loading}>
            {#if loading}
              ...
            {:else}
              Rename
            {/if}
          </button>
        </div>
      {/if}
    </div>

    <div class="modal__backdrop" on:click={() => active = false} />
  </div>
{/if}

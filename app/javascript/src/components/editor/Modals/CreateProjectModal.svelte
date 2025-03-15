<script>
  import Modal from "@components/editor/Modals/Modal.svelte"
  import { currentProject, isSignedIn, modal } from "@stores/editor"
  import { createProject, renameCurrentProject, setUrl } from "@utils/project"
  import { submittable } from "@components/actions/submittable"

  let loading
  let value

  $: if ($modal?.key === "create-project") setValue($modal?.type === "rename" ? $currentProject.title : "")

  async function newProject() {
    loading = true

    const data = await createProject(value)
    if (data != "error") {
      modal.close()
      if (data) setUrl(data.uuid)
    }

    loading = false
  }

  async function renameProject() {
    if (!$isSignedIn) {
      alert("You must be signed in to rename a project")
      modal.close()
      return
    } else if (!$currentProject) {
      alert("No project selected? This is probably a bug.")
      modal.close()
      return
    }

    loading = true

    const data = await renameCurrentProject(value)
    if (data) modal.close()

    loading = false
  }

  function setValue(title) {
    value = title
  }
</script>

<Modal flush>
  {#if !$isSignedIn}
    <div class="warning warning--orange text-small">
      You are not signed in and this is for demonstration purposes only. Any changes you make will not be saved.
    </div>
  {/if}

  {#if $modal?.type == "create"}
    <div class="p-1/2">
      <h3 class="mb-0 mt-0">Create a new project</h3>

      <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value use:submittable on:submit={newProject} />

      <button class="button w-100 mt-1/4" on:click={newProject} disabled={!value || loading}>
        {#if loading}
          ...
        {:else}
          Create
        {/if}
      </button>
    </div>
  {:else if $modal?.type == "rename"}
    <div class="p-1/2">
      <h3 class="mb-0 mt-0">Rename {$currentProject?.title || "this project"}</h3>

      <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value use:submittable on:submit={renameProject} />

      <button class="button w-100 mt-1/4" on:click={renameProject} disabled={!value || loading}>
        {#if loading}
          ...
        {:else}
          Rename
        {/if}
      </button>
    </div>
  {/if}
</Modal>

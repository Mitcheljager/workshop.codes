<script>
  import SearchObjects from "./SearchObjects.svelte"
  import CreateProjectModal from "./Modals/CreateProjectModal.svelte"
  import { projects, currentProject } from "../../stores/editor"
  import { getSaveContent } from "../../utils/editor"
  import { createProject, destroyCurrentProject, fetchProject } from "../../utils/project"
  import { onMount } from "svelte"
  import { fly } from "svelte/transition"
  import { flip } from "svelte/animate"

  let showModalOfType
  let loading = false
  let active = false
  let showProjectSettings = false
  let filteredProjects = $projects

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const uuid = urlParams.get("uuid")

    if (uuid) getProject(uuid)
    else if ($projects.length) getProject($projects[0].uuid)
  })

  async function getProject(uuid) {
    loading = true
    active = false

    const data = await fetchProject(uuid)
    if (data) setUrl(data.uuid)

    loading = false
  }

  async function destroyProject() {
    if (!confirm("Are you absolutely sure you want to destroy this project? This can not be undone.")) return

    loading = true

    const data = await destroyCurrentProject()
    if (data) setUrl()

    showProjectSettings = false
    loading = false
  }

  async function duplicateProject() {
    if (!confirm("This will create a copy of the current project. Do you want to continue?")) return

    loading = true

    const content = getSaveContent()
    const data = await createProject($currentProject.title + " (Copy)", content)
    if (data) {
      setUrl(data.uuid)
      await fetchProject(data.uuid)
    }

    showProjectSettings = false
    loading = false
  }

  function outsideClick(event) {
    if (!active && !showProjectSettings) return
    if (event.target.classList.contains("dropdown") || event.target.closest(".dropdown")) return

    active = false
    showProjectSettings = false
  }

  function setUrl(uuid) {
    const url = new URL(window.location)
    if (uuid) url.searchParams.set("uuid", uuid)
    else url.searchParams.delete("uuid")
    window.history.replaceState("", "", url)
  }
</script>

<svelte:window on:click={outsideClick} on:keydown={event => { if (event.key === "Escape") { active = false } }} />

<CreateProjectModal bind:showModalOfType on:setUrl={({ detail }) => setUrl(detail)} />

<div class="dropdown">
  <button class="form-select pt-1/8 pb-1/8 pl-1/4 text-left" on:click|stopPropagation={() => active = !active} style="min-width: 200px" disabled={loading}>
    {#if loading}
      Loading...
    {:else}
      {$currentProject?.title || "Select a project..."}
    {/if}
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--left block w-100">
      <div class="pl-1/8 pr-1/8">
        <SearchObjects objects={$projects} bind:filteredObjects={filteredProjects} />
      </div>

      <hr />

      {#each filteredProjects as project (project.uuid)}
        <div class="dropdown__item" animate:flip={{ duration: 100 }} on:click={() => getProject(project.uuid)}>
          {project.title}
        </div>
      {/each}

      {#if $projects?.length && !filteredProjects.length}
        <em class="block text-dark text-small pl-1/8 pr-1/8">No projects match your search.</em>
      {/if}

      {#if $projects?.length}
        <hr />
      {/if}

      <div class="p-1/4">
        {#if !$projects?.length}
          <em class="text-small block mb-1/4">Create a new project to get started.</em>
        {/if}
        <button class="button button--small w-100" on:click={() => {
          active = false
          showModalOfType("create")
        }}>
          Create new
        </button>
      </div>
    </div>
  {/if}
</div>

{#if $currentProject?.is_owner && !loading}
  <div class="dropdown">
    <button class="empty-button w-auto text-base ml-1/8" on:click|stopPropagation={() => showProjectSettings = !showProjectSettings}>
      Edit
    </button>

    {#if showProjectSettings}
      <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--left block w-100" style="width: 200px">
        <div class="dropdown__item" on:click={() => showModalOfType("rename", $currentProject.title)}>
          Rename
        </div>

        <div class="dropdown__item" on:click={duplicateProject}>
          Duplicate
        </div>

        <div class="dropdown__item text-red" on:click={destroyProject}>
          Destroy
        </div>
      </div>
    {/if}
  </div>
{/if}

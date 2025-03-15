<script>
  import SearchObjects from "@components/editor/SearchObjects.svelte"
  import { projects, currentProject, isSignedIn, isMobile, modal, currentProjectUUID } from "@stores/editor"
  import { getSaveContent } from "@utils/editor"
  import { createProject, destroyCurrentProject, fetchProject, setUrl } from "@utils/project"
  import { escapeable } from "@components/actions/escapeable"
  import { outsideClick } from "@components/actions/outsideClick"
  import { onMount } from "svelte"
  import { fly } from "svelte/transition"
  import { flip } from "svelte/animate"

  let loading = false
  let active = false
  let showProjectSettings = false
  let ownProjects = []
  let filteredProjects = []

  $: ownProjects = $projects.filter(({ is_owner }) => is_owner)
  $: limit = $isMobile ? 5 : 25

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const uuid = urlParams.get("uuid")

    if (uuid) getProject(uuid)
    else if (ownProjects.length) getProject(ownProjects[0].uuid)
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

  async function duplicateProject(useForkLabel) {
    if (!confirm("This will create a copy of the current project. Do you want to continue?")) return

    loading = true

    const content = getSaveContent()

    const thisProject = $currentProject ?? await fetchProject($currentProjectUUID)

    const data = await createProject(thisProject.title + ` (${useForkLabel ? "Fork" : "Copy"})`, content)
    if (data) {
      setUrl(data.uuid)
      await fetchProject(data.uuid)
    }

    showProjectSettings = false
    loading = false
  }
</script>

<div class="dropdown" style:max-width="200px" use:outsideClick on:outsideClick={() => active = false}>
  <button class="form-select pt-1/8 pb-1/8 pl-1/4 text-left" on:click|stopPropagation={() => active = !active} style:min-width="{$isMobile ? 75 : 200}px" disabled={loading}>
    {#if loading}
      Loading...
    {:else if $currentProject}
      <span class="w-100 text-truncate nowrap">{$currentProject.title}</span>
    {:else}
      Select a project...
    {/if}
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} use:escapeable on:escape={() => active = false} class="dropdown__content dropdown__content--left block w-100" style:min-width="200px">
      <div class="pl-1/8 pr-1/8">
        <SearchObjects objects={ownProjects} bind:filteredObjects={filteredProjects} />
      </div>

      <hr />

      {#each filteredProjects as project (project.uuid)}
        <button class="dropdown__item text-truncate" animate:flip={{ duration: 100 }} on:click={() => getProject(project.uuid)}>
          {project.title}
        </button>
      {/each}

      {#if ownProjects?.length && !filteredProjects.length}
        <em class="block text-dark text-small pl-1/8 pr-1/8">No projects match your search.</em>
      {/if}

      {#if ownProjects?.length}
        <hr />
      {/if}

      <div class="p-1/4">
        {#if !ownProjects?.length}
          <em class="text-small block mb-1/4">Create a new project to get started.</em>
        {/if}
        <button class="button button--small w-100" on:click={() => {
          active = false
          modal.show("create-project", { type: "create" })
        }}>
          Create new
        </button>
      </div>
    </div>
  {/if}
</div>

{#if $isSignedIn && !loading}
  {#if $currentProject?.is_owner}
    <div class="dropdown" use:outsideClick on:outsideClick={() => showProjectSettings = false}>
      <button class="w-auto text-base ml-1/8" on:click|stopPropagation={() => showProjectSettings = !showProjectSettings}>
        Edit
      </button>

      {#if showProjectSettings}
        <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--left block w-100" style="width: 200px">
          <button class="dropdown__item" on:click={() => modal.show("create-project", { type: "rename" })}>
            Rename
          </button>

          <button class="dropdown__item" on:click={() => duplicateProject(false)}>
            Duplicate
          </button>

          <button class="dropdown__item text-red" on:click={destroyProject}>
            Destroy
          </button>
        </div>
      {/if}
    </div>
  {:else if $currentProjectUUID}
    <button class="w-auto text-base ml-1/8" on:click={() => duplicateProject(true)}>
      Fork
    </button>
  {/if}
{/if}

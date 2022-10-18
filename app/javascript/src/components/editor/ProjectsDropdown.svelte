<script>
  import FetchRails from "../../fetch-rails"
  import { projects, currentProject, items, currentItem, isSignedIn } from "../../stores/editor"
  import { fly, fade } from "svelte/transition"
  import { onMount } from "svelte"

  let value
  let loading = false
  let active = false
  let showCreateModal = false
  let showProjectSettings = false

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const uuid = urlParams.get("uuid")

    if (uuid) fetchProject(uuid)
    else if ($projects.length) fetchProject($projects[0].uuid)
  })

  function fetchProject(uuid) {
    $currentProject = null
    loading = true

    const url = new URL(window.location)
    url.searchParams.set("uuid", uuid)
    window.history.replaceState('', '', url)

    const baseUrl = "/projects/"

    new FetchRails(baseUrl + uuid).get()
      .then(data => {
        if (!data) throw Error("No results")

        const parsedData = JSON.parse(data)

        $currentProject = {
          uuid: parsedData.uuid,
          title: parsedData.title,
          is_owner: parsedData.is_owner
        }

        $currentItem = {}
        $items = JSON.parse(parsedData.content) || []
      })
      .catch(error => {
        console.error(error)
        alert(`Something went wrong while loading, please try again. ${error}`)
      })
      .finally(() => loading = false)
  }

  function createProject() {
    if (!$isSignedIn) {
      createDemoProject()
      return
    }

    loading = true

    new FetchRails("/projects", { project: { title: value } }).post()
      .then(data => {
        if (!data) throw Error("Create failed")

        const parsedData = JSON.parse(data)

        $projects = [...$projects, parsedData]
        $currentProject = parsedData
        $currentItem = {}
        $items = []
        showCreateModal = false
      })
      .catch(error => {
        console.error(error)
        alert("Something went wrong while creating your project, please try again")
      })
      .finally(() => loading = false)
  }

  function createDemoProject() {
    const newProject = {
      uuid: Math.random().toString(16).substring(2, 8),
      title: value,
      is_owner: true
    }

    $currentProject = newProject
    $currentItem = {}
    $items = []
    showCreateModal = false
  }

  function destroyProject() {
    if (!confirm("Are you absolutely sure you want to destroy this project? This can not be undone.")) return

    loading = true
    showProjectSettings = false

    new FetchRails(`/projects/${ $currentProject.uuid }`).post({ method: "delete" })
      .then(data => {
        if (!data) throw Error("Create failed")

        $projects = $projects.filter(p => p.uuid != $currentProject.uuid)
        $currentProject = null
        $currentItem = {}
      })
      .catch(error => {
        console.error(error)
        alert("Something went wrong while destroying your project, please try again")
      })
      .finally(() => loading = false)
  }

  function outsideClick(event) {
    if (!active && !showProjectSettings) return
    if (event.target.classList.contains("dropdown")) return

    active = false
    showProjectSettings = false
  }
</script>

<svelte:window on:click={outsideClick} on:keydown={event => { if (event.key === "Escape") active = false }} />

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
      {#each $projects as project}
        <div class="dropdown__item" on:click={() => fetchProject(project.uuid)}>
          {project.title}
        </div>
      {/each}

      {#if $projects?.length}
        <hr />
      {/if}

      <div class="p-1/4">
        {#if !$projects?.length}
          <em class="text-small block mb-1/4">Create a new project to get started.</em>
        {/if}
        <button class="button button--small w-100" on:click={() => showCreateModal = true}>Create new</button>
      </div>
    </div>
  {/if}
</div>

{#if showCreateModal}
  <div class="modal" transition:fade={{ duration: 100 }} data-hide-on-close>
    <div class="modal__content p-0">
      {#if !$isSignedIn}
        <div class="warning warning--orange">
          You are not signed in and this is for demonstration purposes only. This will not be saved.
        </div>
      {/if}

      <div class="p-1/2">
        <h3 class="mb-0 mt-0">Create a new project</h3>

        <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value />

        <button class="button w-100 mt-1/4" on:click={createProject} disabled={!value || loading}>Create</button>
      </div>
    </div>

    <div class="modal__backdrop" on:click={() => showCreateModal = false} />
  </div>
{/if}

{#if !loading}
  <div class="dropdown">
    <button class="empty-button w-auto text-base ml-1/8" on:click|stopPropagation={() => showProjectSettings = !showProjectSettings}>
      Edit
    </button>

    {#if showProjectSettings}
      <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--left block w-100" style="width: 200px">
        <div class="dropdown__item text-red" on:click={destroyProject}>
          Destroy
        </div>
      </div>
    {/if}
  </div>
{/if}

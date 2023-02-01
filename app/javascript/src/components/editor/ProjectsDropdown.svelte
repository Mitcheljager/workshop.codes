<script>
  import FetchRails from "../../fetch-rails"
  import { projects, currentProjectUUID, currentProject, items, currentItem, isSignedIn } from "../../stores/editor"
  import { addAlert } from "../../lib/alerts"
  import { fly, fade } from "svelte/transition"
  import { onMount } from "svelte"
  import { updateProject } from "../../utils/editor"

  let value
  let loading = false
  let active = false
  let showModal = false
  let modalType = "create"
  let showProjectSettings = false

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const uuid = urlParams.get("uuid")

    if (uuid) fetchProject(uuid)
    else if ($projects.length) fetchProject($projects[0].uuid)
  })

  async function fetchProject(uuid) {
    loading = true

    const baseUrl = "/projects/"

    new FetchRails(baseUrl + uuid).get()
      .then(data => {
        if (!data) throw Error("No results")

        const parsedData = JSON.parse(data)

        setUrl(parsedData.uuid)
        updateProject(parsedData.uuid, {
          uuid: parsedData.uuid,
          title: parsedData.title,
          is_owner: parsedData.is_owner
        })

        $currentProjectUUID = parsedData.uuid

        $currentItem = {}
        $items = JSON.parse(parsedData.content) || []
      })
      .catch(error => {
        $items = []
        $currentItem = {}
        console.error(error)
        alert(`Something went wrong while loading, please try again. ${ error }`)
      })
      .finally(() => loading = false)
  }

  function createProject() {
    if (!$isSignedIn) {
      createDemoProject()
      return
    }

    loading = true

    new FetchRails("/projects", { project: { title: value, content_type: "workshop_codes" } }).post()
      .then(data => {
        if (!data) throw Error("Create failed")

        const parsedData = JSON.parse(data)

        setUrl(parsedData.uuid)

        $projects = [...$projects, parsedData]
        $currentProjectUUID = parsedData.uuid
        $currentItem = {}
        $items = []
        showModal = false
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

    $projects = [...$projects, newProject]
    $currentProjectUUID = newProject.uuid
    $currentItem = {}
    $items = []
    showModal = false
  }

  function renameProject() {
    if (!$isSignedIn) {
      alert("You must be signed in to rename a project")
      showModal = false
      return
    } else if (!$currentProject) {
      alert("No project selected? This is probably a bug.")
      showModal = false
      return
    }

    loading = true

    new FetchRails(`/projects/${ $currentProjectUUID }`).request("PATCH", { parameters: { body: JSON.stringify({ project: { title: value } }) } })
      .then(data => {
        if (!data) throw Error("Project rename failed")

        updateProject($currentProjectUUID, {
          title: value
        })

        showModal = false

        addAlert("Project renamed to " + $currentProject.title)
      })
      .catch(error => {
        console.error(error)
        alert("Something went wrong while renaming your project. Please try again.")
      })
      .finally(() => loading = false)
  }

  function destroyProject() {
    if (!confirm("Are you absolutely sure you want to destroy this project? This can not be undone.")) return

    loading = true
    showProjectSettings = false

    new FetchRails(`/projects/${ $currentProjectUUID }`).post({ method: "delete" })
      .then(data => {
        if (!data) throw Error("Create failed")

        setUrl()

        $projects = $projects.filter(p => p.uuid != $currentProjectUUID)
        $currentProjectUUID = null
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

  function setUrl(uuid) {
    const url = new URL(window.location)
    if (uuid) url.searchParams.set("uuid", uuid)
    else url.searchParams.delete("uuid")
    window.history.replaceState("", "", url)
  }
</script>

<svelte:window on:click={outsideClick} on:keydown={event => { if (event.key === "Escape") { active = false; showModal = false } }} />

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
      {#each $projects as project (project.uuid)}
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
        <button class="button button--small w-100" on:click={() => {
          value = ""
          modalType = "create"
          showModal = true
        }}>
          Create new
        </button>
      </div>
    </div>
  {/if}
</div>

{#if showModal}
  <div class="modal modal--top" transition:fade={{ duration: 100 }} data-ignore>
    <div class="modal__content p-0" transition:fly={{ y: 100, duration: 200 }}>
      {#if !$isSignedIn}
        <div class="warning warning--orange">
          You are not signed in and this is for demonstration purposes only. This will not be saved.
        </div>
      {/if}

      {#if modalType == "create"}
        <div class="p-1/2">
          <h3 class="mb-0 mt-0">Create a new project</h3>

          <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value />

          <button class="button w-100 mt-1/4" on:click={createProject} disabled={!value || loading}>Create</button>
        </div>
      {:else if modalType == "rename"}
        <div class="p-1/2">
          <h3 class="mb-0 mt-0">Rename {$currentProject?.title || "this project"}</h3>

          <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value />

          <button class="button w-100 mt-1/4" on:click={renameProject} disabled={!value || loading}>Rename</button>
        </div>
      {/if}
    </div>

    <div class="modal__backdrop" on:click={() => showModal = false} />
  </div>
{/if}

{#if $currentProject?.is_owner && !loading}
  <div class="dropdown">
    <button class="empty-button w-auto text-base ml-1/8" on:click|stopPropagation={() => showProjectSettings = !showProjectSettings}>
      Edit
    </button>

    {#if showProjectSettings}
      <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--left block w-100" style="width: 200px">
        <div class="dropdown__item" on:click={() => {
          value = $currentProject.title
          modalType = "rename"
          showModal = true
        }}>
          Rename
        </div>
        <div class="dropdown__item text-red" on:click={destroyProject}>
          Destroy
        </div>
      </div>
    {/if}
  </div>
{/if}

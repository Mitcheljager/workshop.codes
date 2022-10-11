<script>
  import FetchRails from "../../fetch-rails"
  import { projects, currentProject, items, currentItem } from "../../stores/editor"
  import { fly, fade } from "svelte/transition"
  import { onMount } from "svelte"

  let active
  let showCreateModal
  let value
  let element
  let loading = true

  $: console.log("currentProject", $currentProject)

  onMount(() => {
    if ($projects.length) fetchProject($projects[0].uuid)
  })

  function fetchProject(uuid) {
    console.log('fetch')
    $currentProject = null
    loading = true

    const baseUrl = "/projects/"

    new FetchRails(baseUrl + uuid).get()
    .then(data => {
      if (!data) throw Error("No results")

      const parsedData = JSON.parse(data)

      $currentProject = {
        uuid: parsedData.uuid,
        title: parsedData.title
      }

      $items = JSON.parse(parsedData.content) || []
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while loading, please try again")
    })
    .finally(() => loading = false)
  }

  function createProject() {
    loading = true

    new FetchRails("/projects", { project: { title: value } }).post()
    .then(data => {
      if (!data) throw Error("Create failed")

      $projects = [...$projects, JSON.parse(data)]
      showCreateModal = false
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while creating your project, please try again")
    })
    .finally(() => loading = false)
  }

  function outsideClick(event) {
    if (!active) return
    if (event.target != element) active = false
  }
</script>

<svelte:window on:click={outsideClick} on:keydown={event => { if (event.key === "Escape") active = false }} />

<div class="dropdown" bind:this={element}>
  <button class="form-select pt-1/8 pb-1/8 pl-1/4 text-left" on:click|stopPropagation={() => active = !active} style="min-width: 200px" disabled={loading}>
    {#if loading}
      Loading...
    {:else}
      {$currentProject?.title || "Select a project"}
    {/if}
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} class="dropdown__content dropdown__content--left block w-100">
      {#each $projects as project}
        <div class="dropdown__item" on:click={() => fetchProject(project.uuid)}>{project.title}</div>
      {/each}

      <hr />

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
    <div class="modal__content">
      <h3 class="mb-0 mt-0">Create a new project</h3>
      <input type="text" class="form-input mt-1/4" placeholder="Project title" bind:value />

      <button class="button w-100 mt-1/4" on:click={createProject} disabled={!value || loading}>Create</button>
    </div>

    <div class="modal__backdrop" on:click={() => showCreateModal = false} />
  </div>
{/if}

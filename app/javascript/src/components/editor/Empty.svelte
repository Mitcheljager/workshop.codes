<script>
  import { isSignedIn, projects, modal } from "@stores/editor"
  import { createDemoProject, createProject, fetchProject, setUrl } from "@utils/project"

  async function getProject(uuid) {
    const data = await fetchProject(uuid)
    if (data) setUrl(data.uuid)
  }
</script>

<div></div>
<div class="editor__scrollable w-100">
  <div class="pl-1/4 pr-1/4" style="max-width: 40rem; margin: 0 auto">
    <h1 class="mb-0">Welcome to the Workshop.codes <mark>Overwatch Workshop Script Editor</mark></h1>
    <small class="text-dark">Catchy name, right?</small>

    <div class="line-height-3/2">
      <p>With this editor, you can create and edit your Workshop modes using a text based editor. If you have not used the Workshop before, using this editor as a starting point might be difficult. If you have never used a text based editor before but you have used the Workshop, consider this the second step to becoming a programmer!</p>

      <p><strong class="text-lightest">Features:</strong></p>

      <ul>
        <li><mark class="text-lightest">Autocomplete</mark> any Workshop actions and values.</li>
        <li><mark class="text-lightest">Automatic variable detecting</mark>, no need to declare your variables anywhere.</li>
        <li>Relevant <mark class="text-lightest">syntax highlighting.</mark></li>
        <li><mark class="text-lightest">Folders</mark>, wow!</li>
        <li>Integrated <mark class="text-lightest">Wiki</mark> search.</li>
        <li>Automatic <mark class="text-lightest">error detection</mark> (it's a bit limited, but still).</li>
        <li>Reduce code repetition using <mark class="text-lightest">Mixins</mark>, <mark class="text-lightest">Loops</mark>, and <mark class="text-lightest">Conditionals</mark>.</li>
        <li>Easily manage <mark class="text-lightest">translations</mark> for all supported languages.</li>
        <li><mark class="text-lightest">Share</mark> your projects with others (Maybe even collaborate together in the future!).</li>
      </ul>

      {#if $projects?.length}
        <div class="flex align-center justify-between mt-1/1">
          <h2>Your projects</h2>
          <button class="button button--ghost button--small" on:click={() => modal.show("create-project", { type: "create" })}>Create new</button>
        </div>

        {#each $projects as { title, uuid, updated_at }}
          <button class="project" on:click={() => getProject(uuid)}>
            <div class="text-lightest">{title}</div>
            <small>Last updated: {new Date(updated_at).toLocaleString()}</small>
          </button>
        {/each}
      {:else}
        <p>Create a new project to get started. Import your existing script or start from zero.</p>

        <button class="button mt-1/8" on:click={() => ($isSignedIn ? createProject : createDemoProject)("My First Project")}>
          Create your first project
        </button>

        <a class="button button--ghost mt-1/8" href="https://workshop.codes/editor?uuid=abb302fc-46ef-4b4c-b7db-e09488463477" target="_blank">Check out a sample project</a>
      {/if}
    </div>
  </div>
</div>

<script>
  import { isSignedIn, projects } from "../../stores/editor"
  import { createDemoProject, createProject, fetchProject, setUrl } from "../../utils/project"

  async function getProject(uuid) {
    const data = await fetchProject(uuid)
    if (data) setUrl(data.uuid)
  }
</script>

<div />
<div class="p-1/2 editor__scrollable w-100">
  <div style="max-width: 40rem; margin: 0 auto">
    <h1 class="mb-0">Welcome to the Workshop.codes <mark>Overwatch Workshop Script Editor</mark></h1>
    <small class="text-dark">Catchy name, right?</small>

    <div class="line-height-3/2">
      <p>With this editor, you can create and edit your Workshop modes using a text based editor. If you have not used the Workshop before, using this editor as a starting point might be difficult. If you have never used a text based editor before but you have used the Workshop, consider this the second step to becoming a programmer!</p>

      <p>
        <strong class="text-white">Features:</strong>
        <ul>
          <li><mark class="text-white">Autocomplete</mark> any Workshop actions and values.</li>
          <li><mark class="text-white">Automatic variable detecting</mark>, no need to declare your variables anywhere.</li>
          <li>Relevant <mark class="text-white">syntax highlighting.</mark></li>
          <li><mark class="text-white">Folders</mark>, wow!</li>
          <li>Integrated <mark class="text-white">Wiki</mark> search.</li>
          <li>Automatic <mark class="text-white">error detection</mark> (it's a bit limited, but still).</li>
          <li>Reduce code repetition using <mark class="text-white">Mixins</mark>, <mark class="text-white">Loops</mark>, and <mark class="text-white">Conditionals</mark>.</li>
          <li>Easily manage <mark class="text-white">translations</mark> for all supported languages.</li>
          <li><mark class="text-white">Share</mark> your projects with others (Maybe even collaborate together in the future!).</li>
        </ul>
      <p>

      {#if $projects?.length}
        <h2 class="mt-1/1">Your projects</h2>

        {#each $projects as { title, uuid, updated_at }}
          <button class="empty-button project" on:click={() => getProject(uuid)}>
            <div class="text-white">{title}</div>
            <small>Last updated: { new Date(updated_at).toLocaleString() }</small>
          </button>
        {/each}
      {:else}
        <p>Create a new project to get started. Import your existing script or start from zero.</p>

        <button class="button" on:click={() => ($isSignedIn ? createProject : createDemoProject)("My First Project")}>
          Create your first project
        </button>

        <a class="button button--ghost" href="https://workshop.codes/editor?uuid=c7b3c40a-2f86-45c4-9b3f-f39d3c2974bc">Check out a sample project</a>
      {/if}
    </div>
  </div>
</div>

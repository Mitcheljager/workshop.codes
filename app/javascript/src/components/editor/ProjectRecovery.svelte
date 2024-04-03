<script>
  import Bugsnag from "@bugsnag/js"
  import * as timeago from "timeago.js"
  import { fly } from "svelte/transition"
  import { recoveredProject, currentProject, currentItem } from "../../stores/editor"
  import { updateProjectContent } from "../../utils/project"

  function recover() {
    Bugsnag.notify("Project was recovered from localStorage.")

    updateProjectContent($recoveredProject.content)
    $currentItem = { forceUpdate: true }

    $recoveredProject = null
  }

  function toDate(date) {
    return new Date(date)
  }
</script>

<div class="project-recovery" transition:fly={{ y: 20, duration: 250 }}>
  <p class="mt-0 text-orange"><strong>While loading this project we found a copy on your machine that is more recent than the copy we fetched.</strong></p>
  <p>Please inspect your project closely and determine if you have lost data since you last worked on it.</p>

  <p>
    The <strong>fetched</strong> project was last saved
    <em>
      {timeago.format($currentProject?.updated_at || "")} <br />
      <small class="text-dark">{toDate($currentProject?.updated_at)}</small>
    </em> <br />

    The <strong>local</strong> project was last saved
    <em>
      {timeago.format($recoveredProject?.updated_at || "")} <br />
      <small class="text-dark">{toDate($recoveredProject?.updated_at)}</small>
    </em>
  </p>

  <p>You are viewing the <strong>fetched</strong> project. If you believe you have lost progress, use the <strong>local</strong> project instead.</p>

  <button class="button bg-orange button--square" on:click={recover}>Use local</button>
  <button class="button button--secondary button--square" on:click={() => $recoveredProject = null}>Use fetched</button>
</div>

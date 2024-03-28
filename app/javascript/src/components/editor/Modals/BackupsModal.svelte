<script>
  import Modal from "./Modal.svelte"
  import { currentProject, items, currentItem, editorStates, modal } from "../../../stores/editor"
  import { translationKeys, defaultLanguage, selectedLanguages } from "../../../stores/translationKeys"
  import { updateProject } from "../../../utils/project"
  import { fetchBackupsForProject, destroyBackup, fetchBackupContent } from "../../../utils/projectBackups"
  import { flip } from "svelte/animate"
  import { onMount } from "svelte"

  let loading = true
  let hasError = false
  let showActionsFor = ""
  let backups = []

  onMount(getBackups)

  async function getBackups() {
    loading = true
    hasError = false

    try {
      backups = await fetchBackupsForProject($currentProject.uuid)
    } catch (e) {
      console.error(e)
      hasError = true
    } finally {
      loading = false
    }
  }

  async function destroy(uuid) {
    if (!confirm("Are you sure? This can not be undone")) return

    const _backups = [...backups] // Copy to reset if action failed
    backups = backups.filter(b => b.uuid !== uuid)
    showActionsFor = ""

    try {
      await destroyBackup(uuid)
    } catch (e) {
      console.error(e)
      backups = _backups
    }
  }

  async function getBackupContent(uuid) {
    if (!confirm("Are you sure? This can not be undone. If you are unsure you could create an additional backup of your current state so you can always go back if you wish.")) return

    const data = await fetchBackupContent(uuid)

    if (!data) return

    updateProject($currentProject.uuid, { title: data.title })

    const parsedContent = JSON.parse(data.content)

    // Update items content and force codemirror to update
    $items = parsedContent.items || parsedContent || []
    $editorStates = {}
    $currentItem = { forceUpdate: true }

    $translationKeys = parsedContent.translations?.keys || {}
    $selectedLanguages = parsedContent.translations?.selectedLanguages || ["en-US"]
    $defaultLanguage = parsedContent.translations?.defaultLanguage || "en-US"

    showActionsFor = ""
    modal.close()
  }
</script>

<Modal>
  <h3 class="mt-0 mb-0">Backups of "{$currentProject.title}""</h3>

  {#if loading}
    <div class="flex justify-center w-100 mt-1/2">
      <div class="spinner" />
    </div>
  {:else if !hasError}
    {#if backups?.length}
      <p class="text-small">You can restore the contents of a backup to replace your current save. Doing so will set it back to the state it was when you made the backup. The backup will continue to exist.</p>

      <div class="project-backups">
        {#each backups as { uuid, created_at } (uuid)}
          <div class="project-backup" animate:flip={{ duration: 200 }}>
            <p class="m-0">Backup created on {new Date(created_at).toLocaleString()}</p>

            <div class="dropdown">
              <button class="button button--link pl-1/8 pr-1/8 pt-0 pb-0" on:click|stopPropagation={() => showActionsFor = showActionsFor === uuid ? "" : uuid}>⋮</button>

              {#if showActionsFor === uuid}
                <div class="dropdown__content block">
                  <button class="dropdown__item" on:click={() => getBackupContent(uuid)}>Restore from backup</button>
                  <button class="dropdown__item text-red" on:click={() => destroy(uuid)}>Delete</button>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p><em class="text-lightest">You have not yet created any backups for this project.</em></p>
      <p>Backups help you keep and restore older versions of your project. This can be useful if you want to make changes to your project, but are afraid you might irreversably mess things up.</p>
    {/if}

    <p class="mt-1/4 mb-0 text-small"><em>Backups are deleted when you delete your project.</em></p>
  {/if}

  {#if hasError}
    <div class="bg-red p-1/4 mt-1/4 text-lightest">
      <p class="mt-0">Something went wrong while fetching your backups.</p>

      <button class="button button--light button--square w-100" on:click={getBackups}>Try again</button>
    </div>
  {/if}
</Modal>

<script>
  import Modal from "@components/editor/Modals/Modal.svelte"
  import EnhanceAudioUploader from "@components/enhance/EnhanceAudioUploader.svelte"
  import { onMount } from "svelte"

  const audioFiles = []
  let loading = true

  onMount(fetchUserAudioFiles)

  function fetchUserAudioFiles() {
    try {

    } catch (error) {

    } finally {
      loading = false
    }
  }
</script>

<Modal maxWidth="40vw">
  <h2 class="mt-0">Enhance</h2>

  <p>Enhance allows you to upload play custom sound effects. This works by connecting your game to Workshop.codes, triggering specific events in order to play sound effects.</p>

  <EnhanceAudioUploader />

  <hr class="mt-1/2 mb-1/2" />

  {#if loading}
    Loading...
  {/if}

  {#if !loading && !audioFiles.length}
    <em class="text-dark">You have not yet uploaded any audio files.</em>
  {/if}
</Modal>

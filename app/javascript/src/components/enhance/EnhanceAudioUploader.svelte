<script>
  let name = ""
  let files = []
</script>

<hr class="mt-1/2 mb-1/2" />

<div class="form-label mb-0">Upload a new audio file</div>

<div class="form-group-uneven">
  <input type="name" class="form-input mt-1/4" bind:value={name} placeholder="File name" />
  <input type="file" class="form-input" accept="audio/mpeg, audio/wav, audio/ogg" bind:files />
</div>

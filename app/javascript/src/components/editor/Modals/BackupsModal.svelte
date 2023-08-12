<script>
  import Modal from "./Modal.svelte"
  import { currentProject, isSignedIn, modal } from "../../../stores/editor"
  import { createProject, renameCurrentProject } from "../../../utils/project"
  import { createEventDispatcher } from "svelte"
  import { fade } from "svelte/transition"

  const dispatch = createEventDispatcher()

  let loading
</script>

<Modal key="backups">

</Modal>

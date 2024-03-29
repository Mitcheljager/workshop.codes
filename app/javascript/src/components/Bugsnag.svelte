<script>
  import Bugsnag from "@bugsnag/js"
  import { onMount } from "svelte"

  export let apiKey = ""

  onMount(() => {
    Bugsnag.start({
      apiKey,
      collectUserIp: false
    })
  })
</script>

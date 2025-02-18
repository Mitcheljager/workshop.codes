<script lang="ts">
  import Bugsnag from "@bugsnag/js"
  import { onMount } from "svelte"

  interface Props { apiKey: string }

  const { apiKey = "" }: Props = $props()

  onMount(() => {
    Bugsnag.start({
      apiKey,
      collectUserIp: false
    })
  })
</script>

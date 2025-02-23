<script lang="ts">
  interface Props {
    horizontal?: boolean
  }

  const { horizontal = false }: Props = $props()
</script>

<svg
  width={horizontal ? 24 : 12}
  height={horizontal ? 12 : 24}
  viewBox={horizontal ? "0 0 100 50" : "0 0 50 100"}>
  {#each [20, 50, 80] as c}
    <circle
      style="fill:currentColor; stroke:none;"
      cx={horizontal ? c : 25}
      cy={horizontal ? 25 : c}
      r={10} />
  {/each}
</svg>

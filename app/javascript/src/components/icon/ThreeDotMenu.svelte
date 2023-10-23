<script>
  export let horizontal = false
</script>

<svg
  width={horizontal ? 24 : 12}
  height={horizontal ? 12 : 24}
  viewBox={horizontal ? "0 0 100 50" : "0 0 50 100"}
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:svg="http://www.w3.org/2000/svg"
>
  {#each [20, 50, 80] as c}
    <circle
      style="fill:currentColor;stroke:none;"
      cx={horizontal ? c : 25}
      cy={horizontal ? 25 : c}
      r={10}
    />
  {/each}
</svg>

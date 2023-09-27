<script>
  export let name = "checkboxes"
  export let categories = []
  export let selected = []
  export let limit = 3

  /**
   * Add the selected option to the list of selected options.
   * If you select more than the given limit the first item will be replaced with the new one.
   * E.g if you selected 1,2,3 and now add 4, the next order will be 2,3,4
   * @param {boolean} checked The state of event checkbox
   * @param {string} value The given value to be added to the selected array
   */
  function bind(checked, value) {
    if (!checked) {
      selected = selected?.filter(o => o !== value)
      return
    }

    if (selected.length >= limit) selected = [...selected.slice(1), value]
    else selected = [...selected, value]
  }
</script>

<div class="well well--scrollable block br-1/2">
  {#each categories as [label, value]}
    <div class="checkbox">
      <input
        type="checkbox"
        {name}
        {value}
        id={name + value}
        checked={selected?.some(o => o === value)}
        on:change={({ target: { checked } }) => bind(checked, value)} />

      <label for={name + value}>{label}</label>
    </div>
  {/each}
</div>

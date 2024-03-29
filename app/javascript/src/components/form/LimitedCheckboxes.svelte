<script>
  export let name = "checkboxes"
  export let options = []
  export let selected = []
  export let limit = 3

  const key = Math.random().toString().substr(2, 8)

  /**
   * Add the selected option to the list of selected options.
   * If you select more than the given limit the first item will be replaced with the new one.
   * E.g if you selected 1,2,3 and now add 4, the next order will be 2,3,4
   * @param {boolean} checked The state of event checkbox
   * @param {string} value The given value to be added to the selected array
   */
  function bind(checked, value) {
    if (!checked) {
      selected = selected?.filter(o => o.toString() !== value.toString())
      return
    }

    if (selected.length >= limit) selected = [...selected.slice(1), value]
    else selected = [...selected, value]
  }

  /**
   * Generate an id for the given value.
   * The id is based on the name and value value.
   * The name might consist of brackets, the first bracket is replaced by an underscore,
   * other brackets are ignored. Spaces are replaced with underscores.
   * This results in an id like post_options_some_value to match Rails ids.
   * @param {string} value The given value to use for the id
   */
  function getId(value) {
    return (name + "_" + value + "_" + key).toLowerCase()
      .replace("[", "_")
      .replace(/\[|\]/g, "")
      .replace(" ", "_")
  }
</script>

<div class="well well--scrollable block br-1/2">
  {#each options as [label, value]}
    <div class="checkbox">
      <input
        type="checkbox"
        {name}
        {value}
        id={getId(value)}
        checked={(selected || []).some(o => o.toString() === value.toString())}
        on:change={({ target: { checked } }) => bind(checked, value)} />

      <label class="w-100" for={getId(value)}>{label}</label>
    </div>
  {/each}
</div>

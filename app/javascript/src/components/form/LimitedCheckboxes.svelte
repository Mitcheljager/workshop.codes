<script lang="ts">
  interface Props { name: string, options: string[], selected?: string[], limit?: number }

  let { name = "checkboxes", options = [], selected = $bindable([]), limit = 3 }: Props = $props()

  const key = Math.random().toString().substr(2, 8)

  /**
   * Add the selected option to the list of selected options.
   * If you select more than the given limit the first item will be replaced with the new one.
   * E.g if you selected 1,2,3 and now add 4, the next order will be 2,3,4
   */
  function setSelected(checked: boolean, value: string): void {
    if (!checked) {
      selected = selected?.filter(o => o.toString() !== value.toString())
      return
    }

    if (selected.length >= limit) selected = [...selected.slice(1), value]
    else selected = [...selected, value]
  }

  /**
   * Generate an id for the given value.
   * The id is based on the name and value.
   * The name might consist of brackets, the first bracket is replaced by an underscore,
   * other brackets are ignored. Spaces are replaced with underscores.
   * This results in an id like post_options_some_value to match Rails ids.
   */
  function getId(value: string): string {
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
        onchange={({ target }) => setSelected((target as HTMLInputElement).checked, value)} />

      <label class="w-100" for={getId(value)}>{label}</label>
    </div>
  {/each}
</div>

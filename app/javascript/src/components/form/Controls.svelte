<script>
  import { onMount } from "svelte"
  import { flip } from "svelte/animate"
  import { fade } from "svelte/transition"
  import Sortable from "sortablejs"

  export let controls = []
  export let name

  let listElement

  const values = [
    ["None", ""],
    ["Custom...", "Custom"],
    ["Ability 1", "Ability 1"],
    ["Ability 2", "Ability 2"],
    ["Crouch", "Crouch"],
    ["Interact", "Interact"],
    ["Jump", "Jump"],
    ["Melee", "Melee"],
    ["Primary Fire", "Primary Fire"],
    ["Reload", "Reload"],
    ["Secondary Fire", "Secondary Fire"],
    ["Ultimate", "Ultimate"]
  ]

  $: if (!controls.length) setTimeout(() => { controls = [{ buttons: [] }] })
  $: value = filterEmpty(controls)

  onMount(createSortable)

  function createSortable() {
    Sortable.create(listElement, {
      handle: "[data-role='controls-item-move-handle']",
      animation: 100,
      store: {
        set: updateOrder
      }
    })
  }

  function filterEmpty() {
    if (!controls.length) return

    const filtered = JSON.parse(JSON.stringify(controls)).filter(item => {
      if (!item.description) return false

      item.buttons = item.buttons.filter(button => button != "")
      return true
    })

    return JSON.stringify(filtered)
  }

  function updateOrder() {
    const listItems = listElement.querySelectorAll("[data-id]")
    const order = Array.from(listItems).map(item => parseInt(item.dataset.id))

    controls = order.map(index => controls[index])
  }

  function setCustom(controlsIndex, buttonIndex) {
    controls[controlsIndex].buttons[buttonIndex] = { "Custom": event.target.value }
  }

  function add() {
    controls = [...controls, { buttons: [] }]
  }

  function remove(index) {
    controls = controls.filter((c, i) => i != index)
  }
</script>

<input type="hidden" { value } { name }/>

<div class="well well--dark block">
  <div bind:this={ listElement }>
    { #each controls as control, index (control) }
      <div
        class="controls-form-item mb-1/4"
        data-id={ index }
        transition:fade={{ duration: 200 }}
        animate:flip={{ duration: 200 }}>

        { #each Array(3) as _, i }
          <span class="controls-form-item__button">
            <div>
              <select
                bind:value={ control.buttons[i] }
                name="controls-items-button-{ i }"
                class="form-select">

                { #each values as [label, value] }
                  <option { value }>{ label }</option>
                { /each }
              </select>

              { #if control?.buttons?.[i] == "Custom" || typeof control?.buttons?.[i] === "object" }
                <input
                  value={ control.buttons[i]["Custom"] || "" }
                  on:change={ () => setCustom(index, i) }
                  type="text"
                  name="controls-item-button-{ i }"
                  class="form-input controls-form-item__custom"
                  maxlength=15 />
              { /if }
            </div>

            { #if i < 2 }
              <span>+</span>
            { /if }
          </span>
        { /each }

        <div class="controls-form-item__description">
          <input
            bind:value={ control.description }
            type="text"
            name="controls-item-description"
            class="form-input pt-1/4 pb-1/4 md:ml-1/4"
            placeholder="Description"
            maxlength=500 />

          <button href="#" data-role="controls-item-move-handle" on:click|preventDefault>⇅</button>
          <button on:click|preventDefault={ () => remove(index) }>🗑️</button>
        </div>
      </div>
    { /each }
  </div>

  <button class="button button--secondary" on:click|preventDefault={ add }>+ Add line</button>
</div>

<script lang="ts">
  import { onMount } from "svelte"
  import { flip } from "svelte/animate"
  import { fade } from "svelte/transition"
  import Sortable from "sortablejs"

  interface Control {
    buttons: Array<string | { "Custom": string }>,
    description: string
  }

  interface Props {
    _controls: Control[],
    name: string
  }

  const { _controls = [], name }: Props = $props()

  let controls: Control[] = $state(_controls?.length ? _controls : [{ buttons: [], description: "" }])
  let listElement: HTMLElement | null = $state(null)

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

  const value: string = $derived(filterEmpty())

  onMount(createSortable)

  function createSortable(): void {
    Sortable.create(listElement!, {
      handle: "[data-role='controls-item-move-handle']",
      animation: 100,
      store: {
        get: () => [],
        set: updateOrder
      }
    })
  }

  function filterEmpty(): string {
    if (!controls.length) return ""

    const filtered = JSON.parse(JSON.stringify(controls)).filter((control: Control) => {
      if (!control.description) return false

      control.buttons = control.buttons.filter(button => button != "")
      return true
    })

    return JSON.stringify(filtered)
  }

  function updateOrder(): void {
    const listItems = Array.from(listElement!.querySelectorAll("[data-id]")) as HTMLElement[]
    const order = listItems.map(item => parseInt(item.dataset.id!))

    controls = order.map(index => controls[index])
  }

  function setCustom(event: Event & { currentTarget: HTMLInputElement }, controlsIndex: number, buttonIndex: number): void {
    const value = event.currentTarget.value
    controls[controlsIndex].buttons[buttonIndex] = { "Custom": value }
  }

  function add(): void {
    controls = [...controls, { buttons: [], description: "" }]
  }

  function remove(index: number): void {
    controls = controls.filter((c, i) => i != index)
  }
</script>

<input type="hidden" {value} {name}/>

<div class="well well--dark block">
  <div bind:this={listElement}>
    {#each controls as control, index (control)}
      <div
        class="controls-form-item mb-1/4"
        data-id={index}
        transition:fade={{ duration: 200 }}
        animate:flip={{ duration: 200 }}>

        {#each Array(3) as _, i}
          <span class="controls-form-item__button">
            <div>
              <select
                bind:value={control.buttons[i]}
                name="controls-items-button-{i}"
                class="form-select">

                {#each values as [label, value]}
                  <option {value}>{label}</option>
                {/each}
              </select>

              {#if control?.buttons?.[i] == "Custom" || typeof control?.buttons?.[i] === "object"}
                <input
                  value={(control.buttons[i] as { Custom?: string })?.Custom || ""}
                  oninput={(event) => setCustom(event, index, i)}
                  type="text"
                  name="controls-item-button-{i}"
                  class="form-input controls-form-item__custom"
                  maxlength=15 />
              {/if}
            </div>

            {#if i < 2}
              <span>+</span>
            {/if}
          </span>
        {/each}

        <div class="controls-form-item__description">
          <input
            bind:value={control.description}
            type="text"
            name="controls-item-description"
            class="form-input pt-1/4 pb-1/4 md:ml-1/4"
            placeholder="Description"
            aria-label="Control description"
            maxlength=500 />

          <button type="button" data-role="controls-item-move-handle">⇅</button>
          <button type="button" onclick={() => remove(index)}>🗑️</button>
        </div>
      </div>
    {/each}
  </div>

  <button type="button" class="button button--secondary" onclick={add}>+ Add line</button>
</div>

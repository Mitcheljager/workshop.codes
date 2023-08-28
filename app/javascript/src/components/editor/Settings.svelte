<script>
  import { fly } from "svelte/transition"
  import { onMount, tick } from "svelte"
  import { escapeable } from "../actions/escapeable"
  import { outsideClick } from "../actions/outsideClick"
  import { setCssVariable } from "../../utils/setCssVariable"
  import { settings } from "../../stores/editor"
  import Cogs from "../icon/Cogs.svelte"

  let mounted = false
  let active = false

  const defaults = { ...$settings }

  const syntaxHighlight = ["string", "punctuation", "keyword", "number", "comment", "variable", "action", "value", "operator", "bool", "invalid", "custom-keyword"]

  $: updateVariables($settings)

  onMount(() => {
    Object.entries($settings).forEach(([key]) => {
      let value = localStorage.getItem(key)
      if (value) {
        if (value == "true") value = true
        if (value == "false") value = false

        $settings[key] = value
      }

      setCssVariable(key, $settings[key])
    })

    $settings = { ...$settings }

    setTimeout(() => mounted = true, 100)
  })

  function updateVariables() {
    if (!mounted) return

    Object.entries($settings).forEach(([key, value]) => {
      setCssVariable(key, value)
      localStorage.setItem(key, value)
    })
  }

  async function resetToDefault() {
    $settings = defaults

    await tick()

    Object.entries($settings).forEach(([key]) => {
      localStorage.removeItem(key)
    })
  }
</script>

<div class="dropdown settings" use:outsideClick on:outsideClick={(() => active = false)}>
  <button class="button button--secondary button--square" on:click|stopPropagation={() => active = !active}>
    <Cogs />
  </button>

  {#if active}
    <div transition:fly={{ duration: 150, y: 20 }} use:escapeable on:escape={() => active = false} class="dropdown__content block p-1/4" style="width: 300px">
      <h5 class="mt-0 mb-1/8">Font</h5>

      <div class="form-group-inline">
        <label for="" class="text-base">Family</label>
        <input type="text" class="form-input bg-darker" bind:value={$settings["editor-font"]} />
      </div>

      <div class="form-group-inline mt-1/8">
        <label for="" class="text-base nowrap">Size</label>
        <input type="range" min=10 max=18 step=1 class="range" bind:value={$settings["editor-font-size"]} />
      </div>

      <hr>

      <h5 class="mt-1/4 mb-1/8">Cursor</h5>

      <div class="form-group-inline">
        <label for="" class="text-base font-size nowrap">Color</label>
        <input type="color" class="color-input" bind:value={$settings["editor-cursor-color"]} />
      </div>

      <div class="form-group-inline mt-1/8">
        <label for="" class="text-base font-size nowrap">Size</label>
        <input type="range" min=1 max=10 step=1 class="range" bind:value={$settings["editor-cursor-width"]} />
      </div>

      <hr>

      <h5 class="mt-1/4 mb-0">Syntax Highlighting</h5>

      {#each syntaxHighlight as color}
        <div class="form-group-inline mt-1/8">
          <label for="" class="text-base font-size nowrap">{color}</label>
          <input type="color" class="color-input" bind:value={$settings[`color-${ color }`]} />
        </div>
      {/each}

      <hr>

      <div class="checkbox mt-1/8">
        <input id="show-line-indent-markers" type="checkbox" bind:checked={$settings["show-indent-markers"]} />
        <label for="show-line-indent-markers">Show line indent markers</label>
      </div>

      <div class="checkbox mt-1/8 mb-1/4">
        <input id="word-wrap" type="checkbox" bind:checked={$settings["word-wrap"]} />
        <label for="word-wrap">Word wrap</label>
      </div>

      <button class="button button--link button--small pb-0" on:click={resetToDefault}>Reset all to default</button>
    </div>
  {/if}
</div>

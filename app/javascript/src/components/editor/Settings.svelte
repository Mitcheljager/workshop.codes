<script>
  import { fly, slide } from "svelte/transition"
  import { onMount, tick } from "svelte"
  import { escapeable } from "@components/actions/escapeable"
  import { outsideClick } from "@components/actions/outsideClick"
  import { setCssVariable } from "@utils/setCssVariable"
  import { settings, isMobile } from "@stores/editor"
  import Cogs from "@components/icon/Cogs.svelte"

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
    <div
      transition:fly={{ duration: 150, y: 20 }}
      use:escapeable on:escape={() => active = false}
      class="dropdown__content block p-1/4"
      style="width: 300px; right: {isMobile ? -70 : 0}px">

      <h5 class="mt-0 mb-1/8">Settings</h5>

      <div class="checkbox tooltip mt-1/8">
        <input id="show-line-indent-markers" type="checkbox" bind:checked={$settings["show-indent-markers"]} />
        <label for="show-line-indent-markers">Show line indent markers</label>

        <div class="tooltip__content bg-darker">
          Show line markers at the expected indents at 1 tab or 4 spaces.
        </div>
      </div>

      <div class="checkbox tooltip mt-1/8">
        <input id="word-wrap" type="checkbox" bind:checked={$settings["word-wrap"]} />
        <label for="word-wrap">Word wrap</label>

        <div class="tooltip__content bg-darker">
          Wrap lines that no longer fit on screen.
        </div>
      </div>

      <div class="checkbox tooltip mt-1/8">
        <input id="autocomplete-semicolon" type="checkbox" bind:checked={$settings["autocomplete-semicolon"]} />
        <label for="autocomplete-semicolon">Insert semicolon on autocomplete</label>

        <div class="tooltip__content bg-darker">
          Insert a semicolon at the end of the line when autocompleting actions.
        </div>
      </div>

      <div class="checkbox tooltip mt-1/8">
        <input id="highlight-trailing-whitespace" type="checkbox" bind:checked={$settings["highlight-trailing-whitespace"]} />
        <label for="highlight-trailing-whitespace">Highlight trailing whitespace</label>

        <div class="tooltip__content bg-darker">
          Mark whitespace at the end of a line.
        </div>
      </div>

      <div class="checkbox tooltip mt-1/8">
        <input id="hide-wiki-sidebar" type="checkbox" bind:checked={$settings["hide-wiki-sidebar"]} />
        <label for="hide-wiki-sidebar">
          Hide wiki sidebar
        </label>

        <div class="tooltip__content bg-darker">
          Hide the wiki sidebar from view. It will not appear when using alt+click on a keyword.
        </div>
      </div>

      <div class="checkbox tooltip mt-1/8">
        <input id="autocomplete-parameter-objects" type="checkbox" bind:checked={$settings["autocomplete-parameter-objects"]} />
        <label for="autocomplete-parameter-objects">
          Autocomplete using parameter objects
        </label>

        <div class="tooltip__content bg-darker">
          Parameter objects change the format of parameters in actions and values to be more readable and less cumbersome to write. You can exclude any parameters you don't change the default off.
        </div>
      </div>

      {#if $settings["autocomplete-parameter-objects"]}
        <div class="form-group mt-1/8 tooltip" transition:slide|local={{ duration: 100 }}>
          <label for="" class="text-base nowrap">Minimum parameter length</label>

          <div class="flex align-center">
            <input type="range" min=1 max=20 step=1 class="range mr-1/8" bind:value={$settings["autocomplete-min-parameter-size"]} />
            {$settings["autocomplete-min-parameter-size"]}
          </div>

          <div class="tooltip__content bg-darker">
            Only autocomplete when an action or value has equal or more than this value in parameters.
          </div>
        </div>

        <div class="form-group mt-1/8 tooltip" transition:slide|local={{ duration: 100 }}>
          <label for="" class="text-base nowrap">Minimum newline length</label>

          <div class="flex align-center">
            <input type="range" min=1 max=20 step=1 class="range mr-1/8" bind:value={$settings["autocomplete-min-parameter-newlines"]} />
            {$settings["autocomplete-min-parameter-newlines"]}
          </div>

          <div class="tooltip__content bg-darker">
            Place each parameter on a new line when the action or value has equal or more than this value in parameters.
          </div>
        </div>
      {/if}

      <hr />

      <h5 class="mt-0 mb-1/8">Font</h5>

      <div class="form-group-inline">
        <label for="" class="text-base">Family</label>
        <input type="text" class="form-input bg-darker" bind:value={$settings["editor-font"]} />
      </div>

      <div class="form-group-inline mt-1/8">
        <label for="" class="text-base nowrap">Size</label>
        <input type="range" min=10 max=18 step=1 class="range" bind:value={$settings["editor-font-size"]} />
      </div>

      <hr/>

      <h5 class="mt-1/4 mb-1/8">Cursor</h5>

      <div class="form-group-inline">
        <label for="" class="text-base font-size nowrap">Color</label>
        <input type="color" class="color-input" bind:value={$settings["editor-cursor-color"]} />
      </div>

      <div class="form-group-inline mt-1/8">
        <label for="" class="text-base font-size nowrap">Size</label>
        <input type="range" min=1 max=10 step=1 class="range" bind:value={$settings["editor-cursor-width"]} />
      </div>

      <hr/>

      <h5 class="mt-1/4 mb-0">Syntax Highlighting</h5>

      {#each syntaxHighlight as color}
        <div class="form-group-inline mt-1/8">
          <label for="" class="text-base font-size nowrap">{color}</label>
          <input type="color" class="color-input" bind:value={$settings[`color-${color}`]} />
        </div>
      {/each}

      <hr/>

      <button class="button button--link button--small pb-0" on:click={resetToDefault}>Reset all to default</button>
    </div>
  {/if}
</div>

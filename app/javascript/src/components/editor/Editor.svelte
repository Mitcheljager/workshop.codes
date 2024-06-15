<script>
  import { onMount, tick } from "svelte"
  import { fly } from "svelte/transition"
  import { currentItem, currentProject, currentProjectUUID, recoveredProject, items, sortedItems, projects, isSignedIn, completionsMap, workshopConstants, isMobile, screenWidth, settings } from "@stores/editor"
  import { toCapitalize } from "@utils/text"
  import FetchRails from "@src/fetch-rails"
  import EditorActions from "@components/editor/EditorActions.svelte"
  import EditorAside from "@components/editor/EditorAside.svelte"
  import EditorWiki from "@components/editor/EditorWiki.svelte"
  import CodeMirror from "@components/editor/CodeMirror.svelte"
  import DragHandle from "@components/editor/DragHandle.svelte"
  import ProjectsDropdown from "@components/editor/ProjectsDropdown.svelte"
  import Empty from "@components/editor/Empty.svelte"
  import ItemFinder from "@components/editor/ItemFinder.svelte"
  import FindReplaceAll from "@components/editor/FindReplaceAll.svelte"
  import LineFinder from "@components/editor/LineFinder.svelte"
  import Modals from "@components/editor/Modals/Modals.svelte"
  import ProjectRecovery from "@components/editor/ProjectRecovery.svelte"
  import Logo from "@components/icon/Logo.svelte"
  import Bugsnag from "@components/Bugsnag.svelte"
  import EyeIcon from "@components/icon/Eye.svelte"
  import Logs from "@components/Editor/Logs.svelte"

  export let bugsnagApiKey = ""
  export let _isSignedIn = false

  let fetchArticle
  let data = null
  let userProjects = null
  let defaults = {}
  let loading = true
  let currentSidebarTab = "wiki"

  $: if ($currentProject && $sortedItems?.length && $currentItem && !Object.keys($currentItem).length)
    $currentItem = $sortedItems.filter(i => i.type == "item")?.[0] || {}

  let isCurrentItemInherentlyHidden = false
  $: isCurrentItemInherentlyHidden = $currentItem && isInherentlyHidden($currentItem)

  $: if (data) $completionsMap = parseKeywords($settings)

  // Updates the tab title
  $: document.title = $currentProject?.title !== undefined ? `${$currentProject.title} | Workshop.codes Script Editor` : "Workshop.codes Script Editor | Workshop.codes"

  $: document.body.classList.toggle("is-firefox", navigator.userAgent.includes("Firefox"))

  onMount(async() => {
    loading = true

    $isSignedIn = _isSignedIn

    ;[data, userProjects] = (
      await Promise.allSettled([fetchData(), fetchProjects()])
    ).map(promise => promise.value)

    if (!data) return

    $workshopConstants = data.constants
    $projects = userProjects || []
    defaults = data.defaults || {}

    $currentItem = $items?.[0] || {}

    loading = false
  })

  function parseKeywords() {
    const { events, values, actions, constants, heroes, maps } = data

    const mappedEvents = objectToKeyword(events, "event")
    const mappedValues = objectToKeyword(values, "text")
    const mappedActions = objectToKeyword(actions, "function")
    const mappedConstants = objectToKeyword(Object.values(constants).map(c => Object.values(c)).flat(1), "constant")
    const mappedHeroes = objectToKeyword(heroes, "text")
    const mappedMaps = objectToKeyword(maps, "text")

    return [...mappedEvents, ...mappedValues, ...mappedActions, ...mappedConstants, ...mappedHeroes, ...mappedMaps]
  }

  function objectToKeyword(obj, keywordType) {
    return Object.values(obj).map(v => {
      const params = {
        label: v["en-US"] || v["name"],
        type: keywordType,
        info: v.description,
        args_length: v.args?.length || 0
      }

      if (v.args_unlimited) params.args_unlimited = true
      if (v.args_allow_null) params.args_allow_null = true

      // Exclude all trailing "null" defaults
      if (v.args?.some(a => a.default?.toString().toLowerCase() == "null")) {
        let nullCount = 0
        for (let i = 0; i < v.args.length; i++) {
          if (v.args[v.args.length - 1 - i].default.toLowerCase() == "null") {
            nullCount++
          } else break
        }

        if (nullCount) params.args_min_length = v.args.length - nullCount
      }

      if (!params.args_length) return params

      // Add detail arguments in autocomplete results
      const detail = v.args.map(a => `${toCapitalize(a.name)}`)
      const joinedDetail = detail.join(", ")

      params.detail_full = joinedDetail
      params.detail = `(${joinedDetail.slice(0, 30)}${joinedDetail.length > 30 ? "..." : ""})`

      // Add apply values when selecting autocomplete, filling in default args
      const lowercaseDefaults = Object.keys(defaults).map(k => k.toLowerCase())
      const useParameterObject = $settings["autocomplete-parameter-objects"] && params.args_length >= $settings["autocomplete-min-parameter-size"]
      const useNewlines = params.args_length >= $settings["autocomplete-min-parameter-newlines"]

      // Generate Apply map to be used for autocomplete and other bits
      const apply = v.args.map(a => {
        const name = toCapitalize(a.name?.toString().toLowerCase())
        let defaultValue = a.default?.toString().toLowerCase().replaceAll(",", "")

        if (lowercaseDefaults.includes(defaultValue.toLowerCase())) defaultValue = defaults[toCapitalize(defaultValue)]
        else defaultValue = toCapitalize(defaultValue)

        return [name, defaultValue]
      })

      // Set completion map keys and default
      params.parameter_keys = detail
      params.parameter_defaults = apply.map(([_, defaultValue]) => defaultValue)

      const applyValues = apply.map(([name, defaultValue]) => {
        // If useParameterObject is enabled add the parameter name to the apply.
        // It's important this happens after setting the parameter_defaults param, as that uses
        // a different format and we don't want it to use the parameter object format.
        if (useParameterObject) return `${useNewlines ? "\n\t" : ""} ${name}: ${defaultValue}`
        return defaultValue
      })

      // params.apply is used by CodeMirror for autocompete values.
      // The value we set is dependent on useParameterObjects and useNewlines.
      params.apply = useParameterObject ?
        useNewlines ?
          `${v["en-US"]}({ ${applyValues.join(",")}\n})` :
          `${v["en-US"]}({ ${applyValues.join(", ")} })` :
        `${v["en-US"]}(${applyValues.join(", ")})`

      // Add arguments to info box
      params.info += "\n\nArguments: "
      params.info += detail

      return params
    })
  }

  function isInherentlyHidden(item) {
    if (item.hidden) return true
    if (!item.parent) return false

    const parent = $sortedItems.find((parentItem) => parentItem.id === item.parent)
    if (!parent) return false

    return isInherentlyHidden(parent)
  }

  async function fetchData() {
    return new FetchRails("/editor/data.json").get()
      .then(data => {
        if (!data) throw Error("No data was returned.")

        return JSON.parse(data)
      })
      .catch(error => {
        alert(`Something went wrong while loading, please try again. ${error}`)
      })
  }

  async function fetchProjects() {
    if (!$isSignedIn) return []

    return new FetchRails("/editor/user_projects.json").get()
      .then(data => {
        if (!data) throw Error("No projects data was returned.")

        return JSON.parse(data)
      })
      .catch(error => {
        alert(`Something went wrong while loading, please try again. ${error}`)
      })
  }
</script>

<svelte:window bind:innerWidth={$screenWidth} />

<div class="editor" class:editor--empty={!$currentProjectUUID} class:editor--no-wiki={$settings["hide-wiki-sidebar"]}>
  <div class="editor__top">
    <button class="w-auto {$isMobile ? "mr-1/4" : "mr-1/2"}" on:click={() => $currentProjectUUID = null}>
      <Logo />
    </button>

    {#if !loading && $projects}
      <ProjectsDropdown />
    {/if}

    {#if $currentProjectUUID}
      <EditorActions />
    {/if}
  </div>

  {#if $currentProjectUUID}
    <div class="editor__aside" in:fly={$isMobile ? { y: -10, duration: 200 } : { x: -10, duration: 200 }}>
      <div class="editor__scrollable">
        <div class="pr-1/4 pl-1/4">
          <ItemFinder />

          <div class="mt-1/16">
            <LineFinder />
          </div>

          <div class="mt-1/16">
            <FindReplaceAll />
          </div>
        </div>

        <hr class="mt-1/4 mb-1/4" />

        <EditorAside />
      </div>

      <DragHandle key="sidebar-width" currentSize=300 />
    </div>

    <div class="editor__content">
      {#if $currentItem?.id}
        <!-- This key makes it so CodeMirror has to re-render when the "word-wrap" setting is changed.
        There could be more elegant solutions that use the CodeMirror API to update extensions,
        but this is the far more simple and readable solution. -->
        {#key $settings["word-wrap"]}
          <CodeMirror on:search={async({ detail }) => {
            currentSidebarTab = "wiki"
            await tick()
            fetchArticle(`wiki/search/${detail}`, true)
          }} />
        {/key}

        {#if isCurrentItemInherentlyHidden}
          <div class="editor-hidden-item-indicator">
            <span class="editor-hidden-item-indicator__content">
              <EyeIcon
                class="vertical-align-text-bottom"
                height="1rem"
                fill="currentColor"
                crossed={true} />
              Hidden
            </span>

            <div class="editor-hidden-item-indicator__tooltip">
              This item or one of its containing folders has been hidden,
              meaning this file won't be included in the compiled output.
              <br /><br />
              To unhide it, hover over the item on the sidebar and press the
              <EyeIcon
                class="vertical-align-middle"
                height="1rem"
                fill="currentColor"
                crossed={true} /> icon.
            </div>
          </div>
        {/if}
      {/if}

      {#if !$items?.length}
        <em class="block p-1/4 text-dark">Your project is empty. Start by creating a new item in the sidebar.</em>
      {/if}
    </div>
  {:else if loading}
    <div class="fullscreen-overlay">
      <div class="spinner"/>
    </div>
  {:else}
    <Empty />
  {/if}

  {#if !$settings["hide-wiki-sidebar"]}
    <div class="editor__popout editor__scrollable" in:fly={$isMobile ? { y: 10, duration: 200 } : { x: 10, duration: 200 }}>
      <div class="tabs bg-transparent p-0 mb-1/4">
        <button class="tabs__item pt-1/8 pb-1/8 m-0 mr-1/4" class:tabs__item--active={currentSidebarTab === "wiki"} on:click={() => currentSidebarTab = "wiki"}>Wiki</button>
        <button class="tabs__item pt-1/8 pb-1/8 m-0" class:tabs__item--active={currentSidebarTab === "logs"} on:click={() => currentSidebarTab = "logs"}>Live inspector logs</button>
      </div>

      {#if currentSidebarTab === "wiki"}
        <EditorWiki bind:fetchArticle />
      {:else}
        <Logs />
      {/if}

      <DragHandle key="popout-width" currentSize=300 align="left" />
    </div>
  {/if}

  {#if $recoveredProject}
    <ProjectRecovery />
  {/if}
</div>

{#if !loading && !$isSignedIn}
  <div class="alerts">
    <div class="alert alert--warning">
      You are not signed in and nothing you do will be saved!
      <a href="/login">Please sign in</a>
    </div>
  </div>
{/if}

<Modals />

{#if bugsnagApiKey}
  <Bugsnag apiKey={bugsnagApiKey} />
{/if}

<script>
  import { onMount } from "svelte"
  import { items, currentItem, openFolders } from "@stores/editor"
  import { isAnyParentHidden, toggleFolderState } from "@utils/editor"
  import EditorItemDestroy from "@components/editor/EditorItemDestroy.svelte"
  import EditorItemHide from "@components/editor/EditorItemHide.svelte"
  import EditorItemDuplicate from "@components/editor/EditorItemDuplicate.svelte"
  import EditorItemName from "@components/editor/EditorItemName.svelte"
  import EditorList from "@components/editor/EditorList.svelte"
  import Chevron from "@components/icon/Chevron.svelte"
  import Folder from "@components/icon/Folder.svelte"

  export let item = {}

  $: expanded = $openFolders.includes(item.id)
  $: hasContents = $items.some(i => i.parent === item.id)
  $: isActiveItemInside = $currentItem && $currentItem.parent === item.id

  onMount(setInitialState)

  function setInitialState() {
    const state = localStorage.getItem(`folder_expanded_${item.id}`) == "true" ? true : false

    if (state) toggleFolderState(item, state, false)
  }

</script>

<div
  class="editor-item editor-folder"
  class:editor-folder--expanded={expanded}
  class:editor-folder--active={isActiveItemInside}
  class:editor-item--hidden={item.hidden || isAnyParentHidden(item)}
  data-item-id={item.id}>
  <button class="editor-folder__icon" on:click|stopPropagation={() => toggleFolderState(item, !expanded)}>
    <Chevron />
  </button>

  <span class="editor-folder__name">
    <Folder fill={hasContents} color={isActiveItemInside ? "white" : "currentColor"} />
    <EditorItemName {item} />
  </span>

  <div class="editor-folder__content" class:editor-folder__content--expanded={expanded}>
    <EditorList parent={item} />
  </div>

  <div class="editor-item__actions">
    <EditorItemDuplicate {item} />
    <EditorItemHide {item} />
    <EditorItemDestroy {item} />
  </div>
</div>

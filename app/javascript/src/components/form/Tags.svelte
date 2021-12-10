<!-- Adapted from https://github.com/agustinl/svelte-tags-input -->

<script>
  import { onMount } from "svelte"
  import { flip } from "svelte/animate"

  export let name = "tags"
  export let placeholder = "Insert tags here"
  export let delimiter = ","
  export let hidden = false
  export let allowRepeats = false
  export let onlyAlphanumeric = false
  export let allowSpace = true
  export let onlyCaps = false
  export let tagLimit = 0
  export let useAutoComplete = false
  export let minCharsAutoComplete = 2
  export let fillValues = []
  export let fetchAutoCompleteValues = value => {
    return new Promise(resolve => resolve([]))
  }

  const storePlaceholder = placeholder

  let values = []
  let input = ""
  let inputElem
  let resultsList
  let autoCompletePromise = fetchAutoCompleteValues(input)
  let timer = null
  let waiting = false
  let readOnly = false

  $: if (useAutoComplete && input.length >= minCharsAutoComplete) {
    clearTimeout(timer)

    waiting = true
    timer = setTimeout(() => {
      autoCompletePromise = fetchAutoCompleteValues(input)
      waiting = false
    }, 200)
  }

  onMount(() => fillValues.forEach(code => addTag(code)))

  function keydown(event) {
    if (event.key == "Backspace" || event.key == "Delete") {
      if (input == "") removeTag(values.length - 1)
    }
    
    if (event.key == "Enter") {
      event.preventDefault()
      return false
    }

    if (useAutoComplete && !waiting && resultsList && resultsList.querySelectorAll("li.tag-item").length) inputHandleAutoComplete(event)
  }

  function inputHandleAutoComplete(event) {
    // TAB: If autocompleting, and a value can be found, add the first value
    if (event.key == "Tab") {
      event.preventDefault()
      resultsList.querySelectorAll("li.tag-item")[0].click()
    }
    // ArrowDown: focus first element of results
    if (event.key == "ArrowDown" || event.key == "Down") {
      event.preventDefault()
      resultsList.querySelector("li:first-child").focus()
    }
    // ArrowUp: focus last element of results
    if (event.key == "ArrowUp" || event.key == "Up") {
      event.preventDefault()
      resultsList.querySelector("li:last-child").focus()
    }
  }

  function cleanInput(value) {
    return splitTags(value)
      .map((tag) => cleanTag(tag))
      .join(delimiter)
  }

  function parseInput() {
    input = cleanInput(input)
    if (!input.includes(delimiter)) return

    splitTags(input).forEach((tag) => addTag(tag))
  }

  function addTag(value) {
    value = cleanTag(value)
    input = ""

    if (value == "") return
    if (!allowRepeats && values.includes(value)) return

    values = [...values, value.trim()]

    if (tagLimit && values.length == tagLimit) {
      readOnly = true
      placeholder = ""
    }

    inputElem.focus()
  }

  function removeTag(index) {
    values = [...values.slice(0, index), ...values.slice(index + 1)]
    placeholder = storePlaceholder
    inputElem.focus()
    
    readOnly = false
  }

  function splitTags(data) {
    return data.split(delimiter)
  }

  function cleanTag(tag) {
    tag = tag.trim()

    if (!allowSpace) tag = tag.replace(/ +/g, "")
    if (onlyAlphanumeric) tag = tag.replace(/[^a-zA-Z0-9 ]+/g, "")
    if (onlyCaps) tag = tag.toUpperCase()

    return tag
  }

  function navAutoComplete(event, index, label, length) {
    if (!useAutoComplete) return

    event.preventDefault()

    if (event.key == "ArrowDown" || event.key == "Down") {
      if (index + 1 >= length) {
        resultsList.querySelector("li:first-child").focus()
        return
      }
      resultsList.querySelectorAll("li.tag-item")[index + 1].focus()
      return
    }

    if (event.key == "ArrowUp" || event.key == "Up") {
      if (index <= 0) {
        resultsList.querySelector("li:last-child").focus()
        return
      }
      resultsList.querySelectorAll("li.tag-item")[index - 1].focus()
      return
    }

    if (event.key == "Enter") {
      addTag(label)
      return
    }

    if (event.key == "Escape" || event.key == "Esc") {
      inputElem.focus()
    }
  }
</script>



<div class="form-tags__wrapper form-input mt-1/4">
  { #each values as value, i (value) }
    <span animate:flip={{ duration: 100 }} class="form-tags__tag">
      { value }

      <div
        class="form-tags__remove-tag"
        on:click|preventDefault={ () => removeTag(i) }>
        &#215;
      </div>
    </span>
  { /each }

  <input
    type="text"
    bind:this={ inputElem }
    bind:value={ input }
    on:input={ parseInput }
    on:keydown={ keydown }
    { readOnly }
    { placeholder }
    class="form-tags__input" />

  <input
    id="post_{ name }"
    name="post[{ name }]"
    value={ hidden ? null : values }
    type="hidden" />
</div>

{ #if useAutoComplete && !waiting && input.length >= minCharsAutoComplete }
  <div class="form-tags-autocomplete-results__anchor">
    <ul bind:this={resultsList} class="form-tags-autocomplete-results">
      { #await autoCompletePromise }
        <li class="list-element"><strong class="m-0">Searching...</strong></li>
      { :then autoCompleteValues }
        { #if autoCompleteValues.length }
          { #each autoCompleteValues.slice(0, 5) as result, index }
            <li
              class="list-element tag-item"
              tabindex="-1"
              on:keydown={ (event) => navAutoComplete(event, index, result.label, autoCompleteValues.length) }
              on:click={ () => addTag(result.label) }>

              { @html result.html }
            </li>
          { /each }
        { :else }
          <li class="list-element"><em>No results on Workshop.codes, but you can still add the code.</em></li>
        { /if }
      { :catch error }
        <li class="list-element">
          <strong class="m-0">
            Something went wrong. Try again later.
          </strong>

          <br />

          <span class="m-0"><small>{ error }</small></span>
        </li>
      { /await }
    </ul>
  </div>
{ /if }

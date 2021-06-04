<script>
  import Tags from './Tags.svelte';

  let showDerivative = false;
</script>

<div class="form-group mt-1/4">
  <div class="switch-checkbox">
    <input
      id="show_derivative"
      class="switch-checkbox__input"
      autocomplete="off"
      type="checkbox"
      bind:checked={showDerivative}
    >
    <label
      class="switch-checkbox__label"
      for="show_derivative"
    >
      This code is a fork/uses other codes
    </label>
  </div>

  <div class="form-group mt-1/4" hidden={!showDerivative}>
    <div class="form-hint--left">
      Enter the import code(s) which your mode uses. You can enter up to X codes. <strong>Separate import codes with a comma ",".</strong>
    </div>

    <Tags
      placeholder="CODE1,CODE2,etc."
      hidden={!showDerivative}
      allowSpace={false}
      onlyAlphanumeric={true}
    />
  </div>
</div>
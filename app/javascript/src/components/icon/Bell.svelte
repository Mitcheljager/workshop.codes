<script>
  export let animating = false
</script>



<svg viewBox="-43 0 512 512" xmlns="http://www.w3.org/2000/svg" class:animating>
  <path d="m413.417969 360.8125c-32.253907-27.265625-50.75-67.117188-50.75-109.335938v-59.476562c0-75.070312-55.765625-137.214844-128-147.625v-23.042969c0-11.796875-9.558594-21.332031-21.335938-21.332031-11.773437 0-21.332031 9.535156-21.332031 21.332031v23.042969c-72.257812 10.410156-128 72.554688-128 147.625v59.476562c0 42.21875-18.496094 82.070313-50.945312 109.503907-8.296876 7.105469-13.054688 17.429687-13.054688 28.351562 0 20.589844 16.746094 37.335938 37.332031 37.335938h352c20.589844 0 37.335938-16.746094 37.335938-37.335938 0-10.921875-4.757813-21.246093-13.25-28.519531zm0 0"/>
  <path class="knocker" d="m213.332031 512c38.636719 0 70.957031-27.542969 78.378907-64h-156.757813c7.425781 36.457031 39.746094 64 78.378906 64zm0 0"/>
</svg>



<style lang="scss">
  @keyframes rotate-bell {
    0% { transform: rotate(0); }
    25% { transform: rotate(-15deg); }
    50% { transform: rotate(15deg); }
    75% { transform: rotate(-10deg); }
    100% { transform: rotate(0); }
  }

  @keyframes move-knocker {
    0% { transform: translateX(0); }
    33% { transform: translateX(-20%); }
    66% { transform: translateX(20%); }
    100% { transform: translateX(0); }
  }

  svg {
    transform-origin: top center;

    &.animating {
      animation: rotate-bell 600ms;

      path {
        &.knocker {
          animation: move-knocker 500ms 200ms;
        }
      }
    }
  }
</style>

<script lang="ts">
  interface Props {
    contract?: boolean,
    [key: string]: any
  }

  const { contract = false, ...rest }: Props = $props()

  const ARROW_STYLE = "fill: currentColor; transform-origin: center; transform-box: fill-box;"

  const cssRotation = $derived(contract ? "rotate(180deg)" : "")
</script>

<svg
  {...rest}
  width="24"
  height="24"
  viewBox="0 0 24 24">
  <path
    d="M 2,3.41421 V 7 C 2,7.55228 1.55228,8 1,8 0.447715,8 0,7.55228 0,7 V 1 C 0,0.447715 0.447715,0 1,0 H 7 C 7.55228,0 8,0.447715 8,1 8,1.55228 7.55228,2 7,2 H 3.41421 l 5.2929,5.29289 c 0.39052,0.39053 0.39052,1.02369 0,1.41422 -0.39053,0.39052 -1.02369,0.39052 -1.41422,0 z"
    style={ARROW_STYLE}
    style:transform={cssRotation}
  />
  <path
    d="M 3.41421,22 H 7 c 0.55228,0 1,0.4477 1,1 0,0.5523 -0.44772,1 -1,1 H 1 C 0.447715,24 0,23.5523 0,23 v -6 c 0,-0.5523 0.447715,-1 1,-1 0.55228,0 1,0.4477 1,1 v 3.5858 l 5.29289,-5.2929 c 0.39053,-0.3905 1.02369,-0.3905 1.41422,0 0.39052,0.3905 0.39052,1.0237 0,1.4142 z"
    style={ARROW_STYLE}
    style:transform={cssRotation}
  />
  <path
    d="M 20.5858,2 H 17 C 16.4477,2 16,1.55228 16,1 16,0.447715 16.4477,0 17,0 h 6 c 0.5523,0 1,0.447715 1,1 V 7 C 24,7.55228 23.5523,8 23,8 22.4477,8 22,7.55228 22,7 V 3.41421 l -5.2929,5.2929 c -0.3905,0.39052 -1.0237,0.39052 -1.4142,0 -0.3905,-0.39053 -0.3905,-1.02369 0,-1.41422 z"
    style={ARROW_STYLE}
    style:transform={cssRotation}
  />
  <path
    d="M 22,20.5858 V 17 c 0,-0.5523 0.4477,-1 1,-1 0.5523,0 1,0.4477 1,1 v 6 c 0,0.5523 -0.4477,1 -1,1 h -6 c -0.5523,0 -1,-0.4477 -1,-1 0,-0.5523 0.4477,-1 1,-1 h 3.5858 l -5.2929,-5.2929 c -0.3905,-0.3905 -0.3905,-1.0237 0,-1.4142 0.3905,-0.3905 1.0237,-0.3905 1.4142,0 z"
    style={ARROW_STYLE}
    style:transform={cssRotation}
  />
</svg>

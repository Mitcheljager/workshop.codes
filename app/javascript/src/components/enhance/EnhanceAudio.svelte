<script>
  import { onMount } from "svelte"

  export let content = {}

  let audioContext
  let audioBuffer
  let source
  let stereoPanner
  let lowPassFilter
  let gain

  let currentContentKey = JSON.stringify(content)

  onMount(playAudio)

  $: if (currentContentKey != JSON.stringify(content)) lerpEffectValues()

  async function playAudio() {
    if (!content.src) return

    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    await loadAudio(content.src)

    source = audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.loop = content.loop === "true"

    setInitialEffectValues()

    source.connect(gain).connect(stereoPanner).connect(lowPassFilter).connect(audioContext.destination)
    source.start()
  }

  async function loadAudio(url) {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
  }

  function setInitialEffectValues() {
    stereoPanner = audioContext.createStereoPanner()
    stereoPanner.pan.value = Math.sin(((content.direction || 0) * Math.PI) / 180)

    lowPassFilter = audioContext.createBiquadFilter()
    lowPassFilter.type = "lowpass"
    lowPassFilter.frequency.value = content.lowpass || 10000

    gain = audioContext.createGain()
    gain.gain.value = Math.max(Math.min(content.volume || 1, 1), 0)
  }

  function lerpEffectValues() {
    const durationInSeconds = 1
    const fps = 30
    const steps = durationInSeconds * fps

    const initialPan = stereoPanner.pan.value
    const targetPan = Math.sin(((content.direction || 0) * Math.PI) / 180)

    const initialFrequency = lowPassFilter.frequency.value
    const targetFrequency = content.lowpass || 10000

    const initialGain = gain.gain.value
    const targetGain = Math.max(Math.min(content.volume || 1, 1), 0)

    let currentStep = 0

    const step = () => {
      if (currentStep > steps) return

      const time = currentStep / steps

      stereoPanner.pan.value = lerp(initialPan, targetPan, time)
      lowPassFilter.frequency.value = lerp(initialFrequency, targetFrequency, time)
      gain.gain.value = lerp(initialGain, targetGain, time)

      currentStep += 1
      requestAnimationFrame(step)
    }

    step()

    currentContentKey = JSON.stringify(content)
  }

  function lerp(start, end, time) {
    return start + time * (end - start)
  }
</script>

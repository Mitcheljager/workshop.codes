export function bind() {
  const element = document.querySelector("[data-role='ollie-form']") as HTMLElement

  if (!element) return

  loadImagesSimultaniously()

  const usernameInput = element.querySelector("input[name='username']")
  usernameInput?.removeAndAddEventListener("input", (event: Event) => setPupilPosition(event, element))
  usernameInput?.removeAndAddEventListener("focus", (event: Event) => setPupilPosition(event, element))
  usernameInput?.removeAndAddEventListener("focus", () => setOllieBody(element, "base"))
  usernameInput?.removeAndAddEventListener("blur", () => resetPupilPosition(element))

  const passwordInput = element.querySelector("input[type='password']")
  passwordInput?.removeAndAddEventListener("focus", () => setOllieBody(element, "eyes-closed"))
  passwordInput?.removeAndAddEventListener("blur", () => setOllieBody(element, "base"))

  const rememberMeInput = element.querySelector("input[type='checkbox'][name='remember_me']")
  rememberMeInput?.removeAndAddEventListener("input", () => setOllieBody(element, "base"))
}

function setPupilPosition(event: Event, element: HTMLElement) {
  const target = event.target as HTMLFormElement
  const max = 32
  const valueLength = Math.min(max, Math.max(0, target.value.length))
  const xOffset = -6 + (valueLength / (max / 6)) * 2
  const pupils = getOlliePart(element, "pupils")

  pupils.style.transform = `translateX(${xOffset}%) translateY(8%)`
}

function resetPupilPosition(element: HTMLElement) {
  const pupils = getOlliePart(element, "pupils")
  pupils.style.transform = "none"
}

function getOlliePart(element: HTMLElement, part: string): HTMLElement {
  return element.querySelector(`[data-ollie="${part}"]`) as HTMLElement
}

function setOllieBody(element: HTMLElement, variant = "base") {
  const base = getOlliePart(element, "body-base")
  const happy = getOlliePart(element, "body-happy")
  const suspicious = getOlliePart(element, "body-suspicious")
  const eyesClosed = getOlliePart(element, "body-eyes-closed")
  const eyesClosedHappy = getOlliePart(element, "body-eyes-closed-happy")
  const pupils = getOlliePart(element, "pupils")
  const armLeft = getOlliePart(element, "arm-left")
  const armRight = getOlliePart(element, "arm-right")

  const rememberMeinput = element.querySelector("input[type='checkbox'][name='remember_me']") as HTMLFormElement
  const rememberMe = rememberMeinput.checked

  base?.classList.toggle("hidden", !(variant === "base" && !rememberMe))
  happy?.classList.toggle("hidden", !(variant === "base" && rememberMe))
  suspicious?.classList.add("hidden")
  eyesClosed?.classList.toggle("hidden", !(variant === "eyes-closed" && !rememberMe))
  eyesClosedHappy?.classList.toggle("hidden", !(variant === "eyes-closed" && rememberMe))
  pupils?.classList.toggle("hidden", variant === "eyes-closed")
  armLeft?.classList.toggle("out-of-view", variant !== "eyes-closed")
  armRight?.classList.toggle("out-of-view", variant !== "eyes-closed")
}

function loadImagesSimultaniously() {
  const element = document.querySelector("[data-role='ollie-image-holder']") as HTMLElement
  const images = element.querySelectorAll("img")

  let imagesLoaded = 0
  images.forEach(image => {
    if (image.complete) {
      imagesLoaded++
      if (imagesLoaded === images.length) element.classList.add("ollie-login__images--loaded")
      return
    }

    image.removeAndAddEventListener("load", () => {
      imagesLoaded++
      if (imagesLoaded === images.length) element.classList.add("ollie-login__images--loaded")
    })
  })
}

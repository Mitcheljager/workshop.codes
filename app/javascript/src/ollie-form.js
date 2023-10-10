export function bind() {
  const element = document.querySelector("[data-role='ollie-form']")

  if (!element) return

  const usernameInput = element.querySelector("input[name='username']")
  usernameInput.removeAndAddEventListener("input", event => setPupilPosition(event, element))
  usernameInput.removeAndAddEventListener("focus", event => setPupilPosition(event, element))
  usernameInput.removeAndAddEventListener("focus", () => setOllieBody(element, "base"))
  usernameInput.removeAndAddEventListener("blur", () => resetPupilPosition(element))

  const passwordInput = element.querySelector("input[type='password']")
  passwordInput.removeAndAddEventListener("focus", () => setOllieBody(element, "eyes-closed"))
  passwordInput.removeAndAddEventListener("blur", () => setOllieBody(element, "base"))

  const rememberMeInput = element.querySelector("input[type='checkbox'][name='remember_me']")
  rememberMeInput.removeAndAddEventListener("input", () => setOllieBody(element, "base"))
}

function setPupilPosition({ target }, element) {
  const max = 32
  const valueLength = Math.min(max, Math.max(0, target.value.length))
  const xOffset = -1 + (valueLength / (max / 2)) * 2

  const pupils = getOlliePart(element, "pupils")
  pupils.style.transform = `translateX(${ xOffset }px) translateY(1px)`
}

function resetPupilPosition(element) {
  const pupils = getOlliePart(element, "pupils")
  pupils.style.transform = "none"
}

function getOlliePart(element, part) {
  return element.querySelector(`[data-ollie="${ part }"]`)
}

function setOllieBody(element, variant = "base") {
  const base = getOlliePart(element, "body-base")
  const happy = getOlliePart(element, "body-happy")
  const suspicious = getOlliePart(element, "body-suspicious")
  const eyesClosed = getOlliePart(element, "body-eyes-closed")
  const eyesClosedHappy = getOlliePart(element, "body-eyes-closed-happy")
  const pupils = getOlliePart(element, "pupils")
  const armLeft = getOlliePart(element, "arm-left")
  const armRight = getOlliePart(element, "arm-right")

  const rememberMe = element.querySelector("input[type='checkbox'][name='remember_me']").checked

  base.classList.toggle("hidden", !(variant === "base" && !rememberMe))
  happy.classList.toggle("hidden", !(variant === "base" && rememberMe))
  suspicious.classList.add("hidden")
  eyesClosed.classList.toggle("hidden", !(variant === "eyes-closed" && !rememberMe))
  eyesClosedHappy.classList.toggle("hidden", !(variant === "eyes-closed" && rememberMe))
  pupils.classList.toggle("hidden", variant === "eyes-closed")
  armLeft.classList.toggle("out-of-view", variant !== "eyes-closed")
  armRight.classList.toggle("out-of-view", variant !== "eyes-closed")
}

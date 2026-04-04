export function bind(): void {
  const elements = Array.from(document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[data-role~='character-count']"))

  elements.forEach(element => {
    element.removeAndAddEventListener("input", () => updateCounter(element))
  })
}

function updateCounter(input: HTMLInputElement | HTMLTextAreaElement): void {
  let textElement = input.nextElementSibling as HTMLElement

  if (textElement?.dataset?.role !== "count") textElement = createElement(input)

  setCurrentRemainingCount(input, textElement)
}

function createElement(input: HTMLInputElement | HTMLTextAreaElement): HTMLElement {
  const textElement = document.createElement("div")
  textElement.dataset.role = "count"
  textElement.classList.add("character-count")

  setCurrentRemainingCount(input, textElement)

  input.insertAdjacentElement("afterend", textElement)

  return textElement
}

function setCurrentRemainingCount(input: HTMLInputElement | HTMLTextAreaElement, textElement: HTMLElement): void {
  const count = parseInt(input.dataset.max || input.maxLength.toString() || "0") - input.value.length

  if (count >= 0) {
    textElement.innerText = `${count} characters remaining`
    textElement.classList.remove("character-count--error")
  } else {
    textElement.innerText = `${Math.abs(count)} characters over the limit`
    textElement.classList.add("character-count--error")
  }
}

const isDark = window.matchMedia("(prefers-color-scheme: dark)")

const head = document.head
const lightSchemeIcons = head.querySelectorAll("link#favicon-light-scheme")
const darkSchemeIcons = head.querySelectorAll("link#favicon-dark-scheme")

if (isDark.matches) {
  lightSchemeIcons.forEach(icon => icon.remove())
  darkSchemeIcons.forEach(icon => document.head.append(icon))
} else {
  darkSchemeIcons.forEach(icon => icon.remove())
  lightSchemeIcons.forEach(icon => document.head.append(icon))
}

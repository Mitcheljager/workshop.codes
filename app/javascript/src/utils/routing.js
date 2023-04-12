export function setOpenProjectInUrl(uuid, replaceState = false) {
  const url = new URL(window.location.href)
  if (uuid) {
    url.searchParams.set("uuid", uuid)
  } else {
    url.searchParams.delete("uuid")
  }

  if (replaceState) {
    window.history.replaceState(window.history.state, "", url)
  } else {
    window.history.pushState(window.history.state, "", url)
  }
}

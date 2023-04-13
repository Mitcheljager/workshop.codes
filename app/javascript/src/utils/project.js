import FetchRails from "../fetch-rails"
import { addAlert } from "../lib/alerts"
import { projects, currentProjectUUID, currentProject, items, currentItem, isSignedIn } from "../stores/editor"
import { translationKeys, defaultLanguage, selectedLanguages } from "../stores/translationKeys"
import { get } from "svelte/store"

export async function createProject(title, content = null) {
  if (!get(isSignedIn)) {
    createDemoProject()
    return
  }

  return await new FetchRails("/projects", { project: { title, content, content_type: "workshop_codes" } }).post()
    .then(data => {
      if (!data) throw Error("Create failed")

      const parsedData = JSON.parse(data)

      projects.set([parsedData, ...get(projects)])
      currentProjectUUID.set(parsedData.uuid)
      currentItem.set({})
      items.set([])

      return parsedData
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while creating your project, please try again")
    })
}

export function createDemoProject() {
  const newProject = {
    uuid: Math.random().toString(16).substring(2, 8),
    title: value,
    is_owner: true
  }

  projects.set([newProject, ...get(projects)])
  currentProjectUUID.set(newProject.uuid)
  currentItem.set({})
  items.set([])
}

export async function fetchProject(uuid) {
  const baseUrl = "/projects/"

  return await new FetchRails(baseUrl + uuid).get()
    .then(data => {
      if (!data) throw Error("No results")

      const parsedData = JSON.parse(data)

      updateProject(parsedData.uuid, {
        uuid: parsedData.uuid,
        title: parsedData.title,
        is_owner: parsedData.is_owner
      })

      currentProjectUUID.set(parsedData.uuid)

      currentItem.set({})

      const parsedContent = JSON.parse(parsedData.content)
      items.set(parsedContent?.items || parsedContent || [])

      translationKeys.set(parsedContent?.translations?.keys || {})
      selectedLanguages.set(parsedContent?.translations?.selectedLanguages || ["en-US"])
      defaultLanguage.set(parsedContent?.translations?.defaultLanguage || "en-US")

      return parsedData
    })
    .catch(error => {
      items.set([])
      currentItem.set({})
      console.error(error)
      alert(`Something went wrong while loading, please try again. ${ error }`)
    })
}

export function updateProject(uuid, params) {
  get(projects).forEach(project => {
    if (project.uuid != uuid) return

    Object.entries(params).forEach(([key, value]) => {
      project[key] = value
    })
  })

  projects.set([...get(projects)])
}

export async function renameCurrentProject(value) {
  return await new FetchRails(`/projects/${ get(currentProjectUUID) }`).request("PATCH", { parameters: { body: JSON.stringify({ project: { title: value } }) } })
    .then(data => {
      if (!data) throw Error("Project rename failed")

      updateProject(get(currentProjectUUID), {
        title: value
      })

      addAlert(`Project renamed to "${ get(currentProject).title }" `)

      return data
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while renaming your project. Please try again.")
    })
}

export async function destroyCurrentProject() {
  return await new FetchRails(`/projects/${ get(currentProjectUUID) }`).post({ method: "delete" })
    .then(data => {
      if (!data) throw Error("Create failed")

      projects.set(get(projects).filter(p => p.uuid != get(currentProjectUUID)))
      currentProjectUUID.set(null)
      currentItem.set({})

      return data
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while destroying your project, please try again")
    })
}

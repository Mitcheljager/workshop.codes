
import FetchRails from "@src/fetch-rails"
import { addAlert } from "@lib/alerts"
import { projects, currentProjectUUID, currentProject, recoveredProject, items, currentItem, isSignedIn } from "@stores/editor"
import { translationKeys, defaultLanguage, selectedLanguages } from "@stores/translationKeys"
import { get } from "svelte/store"
import type { Project, RecoveredProject } from "@src/types/editor"

export async function createProject(title: string, content = null): Promise<Project> {
  if (!get(isSignedIn)) return createDemoProject(title)

  return await new FetchRails("/projects", { project: { title, content, content_type: "workshop_codes" } }).post()
    .then(data => {
      if (!data) throw Error("Create failed")

      const parsedData = JSON.parse(data as string)

      projects.set([parsedData, ...get(projects)])
      currentProjectUUID.set(parsedData.uuid)
      currentItem.set(null)
      items.set([])

      return parsedData
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while creating your project, please try again")

      return "error"
    })
}

export function createDemoProject(title: string): Project {
  const newProject: Project = {
    uuid: Math.random().toString(16).substring(2, 8),
    title,
    content: "",
    is_owner: true
  }

  projects.set([newProject, ...get(projects)])
  currentProjectUUID.set(newProject.uuid)
  currentItem.set(null)
  items.set([])

  return newProject
}

export async function fetchProject(uuid: string): Promise<Project> {
  const baseUrl = "/projects/"

  const localProject: RecoveredProject = getProjectFromLocalStorage(uuid)

  return await new FetchRails(baseUrl + uuid).get()
    .then(data => {
      if (!data) throw Error("No results")

      const parsedData = JSON.parse(data as string)

      // If the project in localStorage is newer than the project from the API
      // something may have gone wrong when saving to the API, but the localStorage
      // was still saved as expected. In this case we use the data from localStorage.
      // This is a fallback and should not be the norm.
      if (localProject && new Date(parsedData.updated_at) < new Date(localProject.updated_at)) {
        recoveredProject.set({
          content: localProject.content,
          updated_at: localProject.updated_at
        })
      }

      updateProject(parsedData.uuid, {
        uuid: parsedData.uuid,
        title: parsedData.title,
        is_owner: parsedData.is_owner,
        updated_at: parsedData.updated_at
      })

      currentProjectUUID.set(parsedData.uuid)
      currentItem.set(null)

      updateProjectContent(parsedData.content)

      return parsedData
    })
    .catch(error => {
      items.set([])
      currentItem.set(null)
      console.error(error)
      alert(`Something went wrong while loading, please try again. ${error}`)
    })
}

export function updateProjectContent(content: string): void {
  const parsedContent = JSON.parse(content)

  items.set(parsedContent?.items || parsedContent || [])
  translationKeys.set(parsedContent?.translations?.keys || {})
  selectedLanguages.set(parsedContent?.translations?.selectedLanguages || ["en-US"])
  defaultLanguage.set(parsedContent?.translations?.defaultLanguage || "en-US")
}

function getProjectFromLocalStorage(uuid: string): RecoveredProject {
  const localContent = JSON.parse(localStorage.getItem("saved-projects") || "{}")
  return localContent[uuid]
}

export function updateProject(uuid: string, params: object): void {
  get(projects).forEach(project => {
    if (project.uuid != uuid) return

    Object.entries(params).forEach(([key, value]) => {
      // @ts-ignore
      project[key] = value
    })
  })

  projects.set([...get(projects)])
}

export async function renameCurrentProject(title: string): Promise<string | void> {
  return await new FetchRails(`/projects/${get(currentProjectUUID)}`).request("PATCH", { parameters: { body: JSON.stringify({ project: { title } }) } })
    .then(data => {
      if (!data) throw Error("Project rename failed")

      updateProject(get(currentProjectUUID)!, {
        title
      })

      addAlert(`Project renamed to "${get(currentProject)!.title}"`)

      return data as string
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while renaming your project. Please try again.")
    })
}

export async function destroyCurrentProject(): Promise<string | void> {
  return await new FetchRails(`/projects/${get(currentProjectUUID)}`).post({ method: "delete" })
    .then(data => {
      if (!data) throw Error("Destroying current project failed")

      projects.set(get(projects).filter(p => p.uuid != get(currentProjectUUID)))
      currentProjectUUID.set(null)
      currentItem.set(null)

      return data as string
    })
    .catch(error => {
      console.error(error)
      alert("Something went wrong while destroying your project, please try again")
    })
}

export function setUrl(uuid: string): void {
  const url = new URL(window.location.toString())
  if (uuid) url.searchParams.set("uuid", uuid)
  else url.searchParams.delete("uuid")
  window.history.replaceState("", "", url)
}

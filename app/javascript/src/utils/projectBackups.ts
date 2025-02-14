import FetchRails from "@src/fetch-rails"
import { addAlert } from "@lib/alerts"
import type { ProjectBackup } from "@src/types/editor"

export async function createProjectBackup(uuid: string): Promise<void> {
  return await new FetchRails("/project_backups", { project: { uuid } }).post()
    .then(data => {
      if (!data) throw Error("Creating backup failed")

      addAlert("Backup successfully created")
    })
    .catch(error => {
      console.error(error)
      addAlert("Something went wrong while creating your backup, please try again", ["alert--error"])
    })
}

export async function fetchBackupsForProject(uuid: string): Promise<ProjectBackup[]> {
  return await new FetchRails(`/project_backups?uuid=${uuid}`).get()
    .then(data => {
      return JSON.parse(data as string) as ProjectBackup[]
    })
    .catch(error => {
      console.error(error)
      throw new Error(error)
    })
}

export async function destroyBackup(uuid: string): Promise<boolean> {
  return await new FetchRails(`/project_backups/${uuid}`).post({ method: "delete" })
    .then(data => {
      if (!data) throw Error("Destroying current project failed")

      return true
    })
    .catch(error => {
      console.error(error)
      addAlert("Something went wrong while deleting your backup, please try again", ["alert--error"])
      throw new Error(error)
    })
}

export async function fetchBackupContent(uuid: string): Promise<ProjectBackup> {
  return await new FetchRails(`/project_backups/${uuid}`).get()
    .then(data => {
      if (!data) throw new Error("Fetch contained no data")

      return JSON.parse(data as string) as ProjectBackup
    })
    .catch(error => {
      console.error(error)
      addAlert("Something went wrong while fetching your backup, please try again", ["alert--error"])
      throw new Error(error)
    })
}

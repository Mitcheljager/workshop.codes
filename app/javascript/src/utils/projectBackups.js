import FetchRails from "@src/fetch-rails"
import { addAlert } from "@lib/alerts"

export async function createProjectBackup(uuid) {
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

export async function fetchBackupsForProject(uuid) {
  return await new FetchRails(`/project_backups?uuid=${uuid}`).get()
    .then(data => {
      return JSON.parse(data)
    })
    .catch(error => {
      console.error(error)
      throw new Error(error)
    })
}

export async function destroyBackup(uuid) {
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

export async function fetchBackupContent(uuid) {
  return await new FetchRails(`/project_backups/${uuid}`).get()
    .then(data => {
      if (!data) throw new Error("Fetch contained no data")
      return JSON.parse(data)
    })
    .catch(error => {
      console.error(error)
      addAlert("Something went wrong while fetching your backup, please try again", ["alert--error"])
      throw new Error(error)
    })
}

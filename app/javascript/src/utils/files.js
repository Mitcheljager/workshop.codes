export async function getMostRecentFileFromDirectory(directoryHandle) {
  let mostRecentFile = null
  let mostRecentDate = new Date(0)

  for await (const entry of directoryHandle.values()) {
    if (entry.kind != "file") continue

    const fileHandle = await directoryHandle.getFileHandle(entry.name)
    const file = await fileHandle.getFile()

    if (file.lastModifiedDate < mostRecentDate) continue

    mostRecentDate = file.lastModifiedDate
    mostRecentFile = file
  }

  return mostRecentFile
}

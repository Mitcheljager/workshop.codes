export async function getMostRecentFileFromDirectory(directoryHandle: FileSystemDirectoryHandle): Promise<File | null> {
  let mostRecentFile = null
  let mostRecentDate = new Date(0)

  for await (const entry of directoryHandle.values()) {
    if (entry.kind != "file") continue

    const fileHandle = await directoryHandle.getFileHandle(entry.name)
    const file = await fileHandle.getFile()

    const lastModifiedDate = new Date(file.lastModified)

    if (lastModifiedDate < mostRecentDate) continue

    mostRecentDate = lastModifiedDate
    mostRecentFile = file
  }

  return mostRecentFile
}

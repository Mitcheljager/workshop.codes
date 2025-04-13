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

export interface OpenFilePickerOptions {
  accept?: string | string[]
  multiple?: boolean
}

export function showOpenFilePicker(options: OpenFilePickerOptions & { multiple: true }): Promise<File[]>
export function showOpenFilePicker(options: OpenFilePickerOptions & { multiple?: false }): Promise<File | null>
export function showOpenFilePicker(options: OpenFilePickerOptions): Promise<File[] | File | null> {
  const fileInputElement = document.createElement("input")
  fileInputElement.type = "file"
  fileInputElement.accept = (
    options.accept && (
      Array.isArray(options.accept) ? options.accept.join(",") : options.accept
    )
  ) ?? "*"
  fileInputElement.multiple = options.multiple ?? false

  return new Promise((resolve) => {
    fileInputElement.addEventListener("change", () => {
      const files = Array.from(fileInputElement.files || [])
      resolve(options.multiple ? files : (files[0] ?? null))
    })

    fileInputElement.click()
  })
}

export function showSaveFilePicker(fileName: string, fileBlob: Blob): void {
  const anchorElement = document.createElement("a")
  anchorElement.download = fileName
  anchorElement.href = URL.createObjectURL(fileBlob)

  anchorElement.click()

  URL.revokeObjectURL(anchorElement.href)
}

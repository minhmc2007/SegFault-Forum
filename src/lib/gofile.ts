const GOFILE_API = "https://api.gofile.io"

export async function uploadToGofile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const serverRes = await fetch(`${GOFILE_API}/servers`)
  const serverData = await serverRes.json()
  const server = serverData.data.servers[0].name

  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append("file", file)

    const xhr = new XMLHttpRequest()

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText)
        if (data.status === "ok") {
          resolve(data.data.downloadPage)
        } else {
          reject(new Error("Gofile upload failed"))
        }
      } catch {
        reject(new Error("Invalid response"))
      }
    }

    xhr.onerror = () => reject(new Error("Network error"))
    xhr.open("POST", `https://${server}.gofile.io/uploadFile`)
    xhr.send(form)
  })
}

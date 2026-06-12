const GOFILE_API = "https://api.gofile.io"

export async function uploadToGofile(file: File): Promise<string> {
  const serverRes = await fetch(`${GOFILE_API}/servers`)
  const serverData = await serverRes.json()
  const server = serverData.data.servers[0].name

  const form = new FormData()
  form.append("file", file)

  const uploadRes = await fetch(`https://${server}.gofile.io/uploadFile`, {
    method: "POST",
    body: form,
  })
  const uploadData = await uploadRes.json()

  if (uploadData.status !== "ok") throw new Error("Gofile upload failed")

  return uploadData.data.downloadPage
}

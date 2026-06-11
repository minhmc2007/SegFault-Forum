const CLOUD_NAME = "dwnhfdwj8"

export type MediaType = "image" | "video"

export interface UploadResult {
  url: string
  type: MediaType
  publicId: string
}

export function useUpload() {
  async function upload(file: File): Promise<UploadResult> {
    const isVideo = file.type.startsWith("video/")
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", "segfault_preset")

    const endpoint = isVideo
      ? `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`
      : `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

    const res = await fetch(endpoint, { method: "POST", body: formData })
    if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`)
    const data = await res.json()

    return {
      url: data.secure_url,
      type: isVideo ? "video" : "image",
      publicId: data.public_id,
    }
  }

  return { upload }
}

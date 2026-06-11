import { useCallback } from "react"
import { useUpload } from "./useUpload"

export function usePasteUpload(onInsert: (md: string) => void) {
  const { upload } = useUpload()

  return useCallback(
    async (e: React.ClipboardEvent) => {
      const items = Array.from(e.clipboardData.items)
      const files = items
        .filter((item) => item.kind === "file" && (item.type.startsWith("image/") || item.type.startsWith("video/")))
        .map((item) => item.getAsFile())
        .filter((f): f is File => f !== null)

      if (files.length === 0) return

      e.preventDefault()

      for (const file of files) {
        const isVideo = file.type.startsWith("video/")

        if (isVideo) {
          const dur = await getDuration(file)
          if (dur > 60) continue
        }

        try {
          const result = await upload(file)
          const md = isVideo
            ? `<video src="${result.url}" controls></video>`
            : `![image](${result.url})`
          onInsert(md)
        } catch {
          // silent fail
        }
      }
    },
    [upload, onInsert]
  )
}

function getDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => resolve(999)
    video.src = URL.createObjectURL(file)
  })
}

import { useRef, useState } from "react"
import { useUpload } from "@/hooks/useUpload"
import { uploadToGofile } from "@/lib/gofile"
import { Loader2, Upload, FileUp } from "lucide-react"

interface SimpleUploaderProps {
  onInsert: (markdown: string) => void
}

const MAX_VIDEO_SEC = 60

export function SimpleUploader({ onInsert }: SimpleUploaderProps) {
  const mediaRef = useRef<HTMLInputElement>(null)
  const gofileRef = useRef<HTMLInputElement>(null)
  const { upload } = useUpload()
  const [mediaUploading, setMediaUploading] = useState(false)
  const [gofileUploading, setGofileUploading] = useState(false)
  const [gofileProgress, setGofileProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  async function handleMediaFiles(files: FileList) {
    setError(null)
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/")

      if (isVideo) {
        const dur = await getDuration(file)
        if (dur > MAX_VIDEO_SEC) {
          setError(`Video must be under ${MAX_VIDEO_SEC}s (${Math.round(dur)}s)`)
          continue
        }
      }

      setMediaUploading(true)
      try {
        const result = await upload(file)
        const md = isVideo
          ? `<video src="${result.url}" controls></video>`
          : `![image](${result.url})`
        onInsert(md)
      } catch {
        setError("Upload failed")
      } finally {
        setMediaUploading(false)
      }
    }
    mediaRef.current!.value = ""
  }

  async function handleGofileUpload(files: FileList) {
    setError(null)
    for (const file of Array.from(files)) {
      setGofileUploading(true)
      setGofileProgress(0)
      try {
        const url = await uploadToGofile(file, (pct) => setGofileProgress(pct))
        const name = file.name.replace(/[[]()]/g, "_")
        onInsert(`[${name}](${url}) *(temporary — expires if downloads are low)*`)
      } catch {
        setError("Gofile upload failed")
      } finally {
        setGofileUploading(false)
        setGofileProgress(0)
      }
    }
    gofileRef.current!.value = ""
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={mediaRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleMediaFiles(e.target.files)}
      />
      <input
        ref={gofileRef}
        type="file"
        className="hidden"
        onChange={(e) => e.target.files && handleGofileUpload(e.target.files)}
      />
      <button
        type="button"
        onClick={() => mediaRef.current?.click()}
        disabled={mediaUploading || gofileUploading}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {mediaUploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {mediaUploading ? "Uploading..." : "Attach media"}
      </button>
      <button
        type="button"
        onClick={() => gofileRef.current?.click()}
        disabled={mediaUploading || gofileUploading}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        title="Upload large files to Gofile (temporary storage)"
      >
        {gofileUploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileUp className="h-3.5 w-3.5" />
        )}
        {gofileUploading ? `${gofileProgress}%` : "Upload binary"}
      </button>
      {error && <p className="text-xs text-destructive w-full">{error}</p>}
    </div>
  )
}

function getDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => reject(0)
    video.src = URL.createObjectURL(file)
  })
}

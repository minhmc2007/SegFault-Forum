import { useRef, useState } from "react"
import { useUpload } from "@/hooks/useUpload"
import { Loader2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleUploaderProps {
  onInsert: (markdown: string) => void
  compact?: boolean
}

const MAX_VIDEO_SEC = 60

export function SimpleUploader({ onInsert, compact }: SimpleUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const { upload } = useUpload()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFiles(files: FileList) {
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

      setUploading(true)
      try {
        const result = await upload(file)
        const md = isVideo
          ? `<video src="${result.url}" controls></video>`
          : `![image](${result.url})`
        onInsert(md)
      } catch {
        setError("Upload failed")
      } finally {
        setUploading(false)
      }
    }
    inputRef.current!.value = ""
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={cn(
          "inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors",
          compact && "text-xs"
        )}
      >
        {uploading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Upload className="h-3.5 w-3.5" />
        )}
        {uploading ? "Uploading..." : "Attach media"}
      </button>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
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

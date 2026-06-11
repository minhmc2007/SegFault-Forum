import { useCallback, useRef, useState } from "react"
import { useUpload, type UploadResult } from "@/hooks/useUpload"
import { Video, X, Loader2, Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface MediaItem {
  file: File
  preview: string
  uploading: boolean
  result?: UploadResult
  error?: string
}

interface MediaUploaderProps {
  images: MediaItem[]
  videos: MediaItem[]
  onImagesChange: (items: MediaItem[]) => void
  onVideosChange: (items: MediaItem[]) => void
  onInsertMarkdown: (markdown: string) => void
}

const MAX_IMAGES = 5
const MAX_VIDEOS = 1
const MAX_VIDEO_DURATION_SEC = 60

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src)
      resolve(video.duration)
    }
    video.onerror = () => reject(new Error("Invalid video"))
    video.src = URL.createObjectURL(file)
  })
}

export function MediaUploader({
  images,
  videos,
  onImagesChange,
  onVideosChange,
  onInsertMarkdown,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { upload } = useUpload()
  const [dragging, setDragging] = useState(false)

  const canAddImages = images.length < MAX_IMAGES
  const canAddVideos = videos.length < MAX_VIDEOS

  const processFiles = useCallback(
    async (files: FileList) => {
      const fileArray = Array.from(files)
      const newImages: MediaItem[] = []
      const newVideos: MediaItem[] = []

      for (const file of fileArray) {
        const isVideo = file.type.startsWith("video/")
        const isImage = file.type.startsWith("image/")

        if (isVideo && canAddVideos) {
          try {
            const duration = await getVideoDuration(file)
            if (duration > MAX_VIDEO_DURATION_SEC) {
              newVideos.push({
                file,
                preview: URL.createObjectURL(file),
                uploading: false,
                error: `Video must be under ${MAX_VIDEO_DURATION_SEC}s (${Math.round(duration)}s)`,
              })
              continue
            }
          } catch {
            // proceed anyway
          }
          newVideos.push({
            file,
            preview: URL.createObjectURL(file),
            uploading: false,
          })
        } else if (isImage && canAddImages) {
          newImages.push({
            file,
            preview: URL.createObjectURL(file),
            uploading: false,
          })
        }
      }

      const updatedImages = [...images, ...newImages].slice(0, MAX_IMAGES)
      const updatedVideos = [...videos, ...newVideos].slice(0, MAX_VIDEOS)
      onImagesChange(updatedImages)
      onVideosChange(updatedVideos)

      // Upload each new item
      for (const item of [...newImages, ...newVideos]) {
        if (item.error) continue
        const idx = [...updatedImages, ...updatedVideos].indexOf(item)
        if (idx >= 0) {
          if (item.file.type.startsWith("image/")) {
            const imgIdx = updatedImages.indexOf(item)
            if (imgIdx >= 0) {
              updatedImages[imgIdx] = { ...item, uploading: true }
              onImagesChange([...updatedImages])
              try {
                const result = await upload(item.file)
                updatedImages[imgIdx] = { ...item, uploading: false, result }
                onImagesChange([...updatedImages])
                onInsertMarkdown(`![image](${result.url})`)
              } catch (e) {
                updatedImages[imgIdx] = { ...item, uploading: false, error: "Upload failed" }
                onImagesChange([...updatedImages])
              }
            }
          } else {
            const vidIdx = updatedVideos.indexOf(item)
            if (vidIdx >= 0) {
              updatedVideos[vidIdx] = { ...item, uploading: true }
              onVideosChange([...updatedVideos])
              try {
                const result = await upload(item.file)
                updatedVideos[vidIdx] = { ...item, uploading: false, result }
                onVideosChange([...updatedVideos])
                onInsertMarkdown(`<video src="${result.url}" controls></video>`)
              } catch (e) {
                updatedVideos[vidIdx] = { ...item, uploading: false, error: "Upload failed" }
                onVideosChange([...updatedVideos])
              }
            }
          }
        }
      }
    },
    [images, videos, canAddImages, canAddVideos, upload, onImagesChange, onVideosChange, onInsertMarkdown]
  )

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) processFiles(e.target.files)
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index)
    onImagesChange(updated)
  }

  function removeVideo(index: number) {
    const updated = videos.filter((_, i) => i !== index)
    onVideosChange(updated)
  }

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        )}
      >
        <Upload className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drop files or click to upload
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Images ({images.length}/{MAX_IMAGES}) &middot; Video ({videos.length}/{MAX_VIDEOS}, max {MAX_VIDEO_DURATION_SEC}s)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((item, i) => (
            <div key={i} className="relative group w-20 h-20 rounded-md overflow-hidden border">
              <img src={item.preview} className="w-full h-full object-cover" alt="" />
              {item.uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {item.error && (
                <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center text-[8px] text-destructive p-1 text-center">
                  {item.error}
                </div>
              )}
              {!item.uploading && !item.error && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(i) }}
                  className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {videos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {videos.map((item, i) => (
            <div key={i} className="relative group w-32 h-24 rounded-md overflow-hidden border">
              <video src={item.preview} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Video className="h-6 w-6 text-white drop-shadow" />
              </div>
              {item.uploading && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
              {item.error && (
                <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center text-[8px] text-destructive p-1 text-center">
                  {item.error}
                </div>
              )}
              {!item.uploading && !item.error && (
                <button
                  onClick={(e) => { e.stopPropagation(); removeVideo(i) }}
                  className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

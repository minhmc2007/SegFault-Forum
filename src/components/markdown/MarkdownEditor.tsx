import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { Eye, Edit3 } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your post in Markdown...",
  minHeight = "300px",
}: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false)

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center border-b bg-muted/50">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-r",
            !preview && "bg-background"
          )}
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 text-sm font-medium",
            preview && "bg-background"
          )}
        >
          <Eye className="h-3.5 w-3.5" />
          Preview
        </button>
      </div>

      {preview ? (
        <div
          className="p-4 overflow-auto"
          style={{ minHeight }}
        >
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 rounded-none resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{ minHeight }}
        />
      )}
    </div>
  )
}

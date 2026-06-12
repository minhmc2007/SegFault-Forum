import { useState, useCallback, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "./MarkdownRenderer"
import { SimpleUploader } from "@/components/upload/SimpleUploader"
import { MentionAutocomplete } from "@/components/editor/MentionAutocomplete"
import { useMentionAutocomplete } from "@/hooks/useMentionAutocomplete"
import { usePasteUpload } from "@/hooks/usePasteUpload"
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
  const {
    mentionQuery,
    results,
    selectedIndex,
    anchorRect,
    handleChange: handleMentionChange,
    handleKeyDown: handleMentionKeyDown,
    insertMention,
  } = useMentionAutocomplete()
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  const handleInsert = useCallback(
    (md: string) => {
      onChange(value ? `${value}\n\n${md}` : md)
    },
    [value, onChange]
  )

  const handlePaste = usePasteUpload(handleInsert)

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      onChange(newValue)
      handleMentionChange(newValue, e.target.selectionStart, e.target)
    },
    [onChange, handleMentionChange]
  )

  const handleSelectMention = useCallback(
    (username: string) => {
      insertMention(username)
      // Force re-read of textarea value after native set
      if (taRef.current) {
        onChange(taRef.current.value)
      }
    },
    [insertMention, onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (handleMentionKeyDown(e) && taRef.current) {
        onChange(taRef.current.value)
      }
    },
    [handleMentionKeyDown, onChange]
  )

  return (
    <div className="border rounded-lg overflow-hidden relative">
      <div className="flex items-center justify-between border-b bg-muted/50">
        <div className="flex items-center">
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
        {!preview && <div className="px-3"><SimpleUploader onInsert={handleInsert} /></div>}
      </div>

      {preview ? (
        <div className="p-4 overflow-auto" style={{ minHeight }}>
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <>
          <Textarea
            ref={taRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={placeholder}
            className="border-0 rounded-none resize-y focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{ minHeight }}
          />
          <MentionAutocomplete
            visible={mentionQuery !== null}
            results={results}
            selectedIndex={selectedIndex}
            anchorRect={anchorRect}
            onSelect={handleSelectMention}
          />
        </>
      )}
    </div>
  )
}

import { useState, useCallback, useRef } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useCreateComment } from "@/hooks/useComments"
import { usePasteUpload } from "@/hooks/usePasteUpload"
import { MentionAutocomplete } from "@/components/editor/MentionAutocomplete"
import { useMentionAutocomplete } from "@/hooks/useMentionAutocomplete"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SimpleUploader } from "@/components/upload/SimpleUploader"
import { SignInButton } from "@/components/auth/SignInButton"
import { Loader2 } from "lucide-react"

interface CommentFormProps {
  postId: string
  parentId?: string | null
  depth?: number
  onDone?: () => void
  placeholder?: string
}

export function CommentForm({
  postId,
  parentId,
  depth = 0,
  onDone,
  placeholder = "Write a comment...",
}: CommentFormProps) {
  const { user } = useAuth()
  const createComment = useCreateComment()
  const [content, setContent] = useState("")
  const taRef = useRef<HTMLTextAreaElement | null>(null)
  const {
    mentionQuery,
    results,
    selectedIndex,
    anchorRect,
    handleChange: handleMentionChange,
    handleKeyDown: handleMentionKeyDown,
    insertMention,
  } = useMentionAutocomplete()

  const handleInsert = useCallback(
    (md: string) => {
      setContent((prev) => (prev ? `${prev}\n\n${md}` : md))
    },
    []
  )

  const handlePaste = usePasteUpload(handleInsert)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    await createComment.mutateAsync(
      {
        postId,
        parentId: parentId ?? null,
        content: content.trim(),
        depth: depth + 1,
      },
      {
        onSuccess: () => {
          setContent("")
          onDone?.()
        },
      }
    )
  }

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      setContent(newValue)
      handleMentionChange(newValue, e.target.selectionStart, e.target)
    },
    [handleMentionChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (handleMentionKeyDown(e) && taRef.current) {
        setContent(taRef.current.value)
      }
    },
    [handleMentionKeyDown]
  )

  const handleSelectMention = useCallback(
    (username: string) => {
      insertMention(username)
      if (taRef.current) {
        setContent(taRef.current.value)
      }
    },
    [insertMention]
  )

  if (!user) {
    return (
      <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
        <SignInButton /> to comment
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 relative">
      <Textarea
        ref={taRef}
        value={content}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        rows={3}
      />
      <MentionAutocomplete
        visible={mentionQuery !== null}
        results={results}
        selectedIndex={selectedIndex}
        anchorRect={anchorRect}
        onSelect={handleSelectMention}
      />
      <div className="flex items-center justify-between gap-2">
        <SimpleUploader onInsert={handleInsert} />
        <div className="flex items-center gap-2">
          {onDone && (
            <Button type="button" variant="ghost" size="sm" onClick={onDone}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || createComment.isPending}
          >
            {createComment.isPending && (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            )}
            {parentId ? "Reply" : "Comment"}
          </Button>
        </div>
      </div>
    </form>
  )
}

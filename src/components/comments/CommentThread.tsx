import { useState } from "react"
import type { Comment, UserRank } from "@/types"
import { rankLabels, rankColors } from "@/types"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { CommentForm } from "./CommentForm"
import { formatDistanceToNow } from "date-fns"
import { Reply } from "lucide-react"
import { cn } from "@/lib/utils"

interface CommentItemProps {
  comment: Comment
  postId: string
}

export function CommentItem({ comment, postId }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false)

  return (
    <div className={cn("flex gap-3", comment.depth > 0 && "ml-8 pl-4 border-l")}>
      <UserAvatar
        username={comment.author?.username ?? "?"}
        avatarUrl={comment.author?.avatar_url ?? null}
        size="sm"
        className="mt-1"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comment.author?.username}</span>
          {comment.author?.rank && (
            <span
              className="text-[10px] font-semibold px-1 py-0.5 rounded"
              style={{ backgroundColor: rankColors[comment.author.rank as UserRank] + "20", color: rankColors[comment.author.rank as UserRank] }}
            >
              {rankLabels[comment.author.rank as UserRank]}
            </span>
          )}
          <span className="text-muted-foreground">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
          </span>
        </div>

        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>

        <button
          onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1 transition-colors"
        >
          <Reply className="h-3 w-3" />
          Reply
        </button>

        {(showReply || comment.depth < 3) && showReply && (
          <div className="mt-3">
            <CommentForm
              postId={postId}
              parentId={comment.id}
              depth={comment.depth}
              onDone={() => setShowReply(false)}
              placeholder={`Reply to ${comment.author?.username}...`}
            />
          </div>
        )}

        {comment.replies && comment.replies.length > 0 && comment.depth < 3 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} postId={postId} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface CommentThreadProps {
  comments: Comment[]
  postId: string
}

export function CommentThread({ comments, postId }: CommentThreadProps) {
  if (comments.length === 0) return null

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </div>
  )
}

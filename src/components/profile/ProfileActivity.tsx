import { useState } from "react"
import { Link } from "react-router-dom"
import { useUserPosts, useUserComments } from "@/hooks/useProfile"
import { formatDistanceToNow } from "date-fns"
import { Loader2, MessageSquare, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileActivityProps {
  userId: string
}

const tabs = [
  { key: "posts", label: "Posts", icon: FileText },
  { key: "comments", label: "Comments", icon: MessageSquare },
] as const

export function ProfileActivity({ userId }: ProfileActivityProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "comments">("posts")

  return (
    <div>
      <div className="flex border-b mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px]",
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === "posts" ? (
        <UserPosts userId={userId} />
      ) : (
        <UserCommentsSection userId={userId} />
      )}
    </div>
  )
}

function UserPosts({ userId }: { userId: string }) {
  const { data: posts, isLoading } = useUserPosts(userId)

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!posts || posts.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No posts yet.</p>
  }

  return (
    <div className="space-y-2">
      {posts.map((post) => (
        <Link
          key={post.id}
          to={`/post/${post.id}`}
          className="block p-3 border rounded-lg hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            {post.category && (
              <span style={{ color: post.category.color }}>{post.category.name}</span>
            )}
            <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" /> {post.comment_count}
            </span>
          </div>
          <p className="font-medium text-sm line-clamp-1">{post.title}</p>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {post.vote_count} votes
          </p>
        </Link>
      ))}
    </div>
  )
}

function UserCommentsSection({ userId }: { userId: string }) {
  const { data: comments, isLoading } = useUserComments(userId)

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No comments yet.</p>
  }

  return (
    <div className="space-y-2">
      {comments.map((comment) => (
        <Link
          key={comment.id}
          to={`/post/${comment.post?.id}`}
          className="block p-3 border rounded-lg hover:border-primary/50 transition-colors"
        >
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span>Replied to {comment.post?.title ?? "a post"}</span>
            <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
          </div>
          <p className="text-sm line-clamp-2">{comment.content}</p>
        </Link>
      ))}
    </div>
  )
}

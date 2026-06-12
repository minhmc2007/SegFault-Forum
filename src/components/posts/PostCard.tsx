import { Link } from "react-router-dom"
import { VoteButton } from "@/components/voting/VoteButton"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare } from "lucide-react"
import type { Post } from "@/types"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="flex gap-3 p-4 border rounded-lg bg-card hover:border-primary/50 transition-colors">
      <VoteButton
        postId={post.id}
        voteCount={post.vote_count}
        userVote={post.user_vote}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {post.category && (
            <Link
              to={`/?category=${post.category.slug}`}
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ backgroundColor: post.category.color + "20", color: post.category.color }}
            >
              {post.category.name}
            </Link>
          )}
          {post.tags?.map((tag) => (
            <span
              key={tag.id}
              className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
            >
              #{tag.name}
            </span>
          ))}
        </div>

        <Link
          to={`/post/${post.id}`}
          className="text-base font-semibold hover:text-primary transition-colors line-clamp-1"
        >
          {post.title}
        </Link>

        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {post.content.replace(/[#*`>\[\]]/g, "").slice(0, 200)}
        </p>

        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <Link
            to={`/profile/${post.author?.username}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <UserAvatar
              username={post.author?.username ?? "?"}
              avatarUrl={post.author?.avatar_url ?? null}
              size="sm"
            />
            {post.author?.username}
          </Link>

          <span>
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </span>

          <Link
            to={`/post/${post.id}`}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {post.comment_count}
          </Link>
        </div>
      </div>
    </div>
  )
}

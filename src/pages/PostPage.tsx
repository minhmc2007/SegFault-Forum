import { useParams, useNavigate, Link } from "react-router-dom"
import { usePost, useDeletePost } from "@/hooks/usePosts"
import { useComments } from "@/hooks/useComments"
import { useAuth } from "@/providers/AuthProvider"
import { MarkdownRenderer } from "@/components/markdown/MarkdownRenderer"
import { VoteButton } from "@/components/voting/VoteButton"
import { UserAvatar } from "@/components/auth/UserAvatar"
import { ReportButton } from "@/components/reports/ReportButton"
import { CommentForm } from "@/components/comments/CommentForm"
import { CommentThread } from "@/components/comments/CommentThread"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Loader2, MessageSquare, Pencil, Trash2 } from "lucide-react"
import { rankLabels, rankColors } from "@/types"
import type { UserRank } from "@/types"

export function PostPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const { data: post, isLoading, error } = usePost(id ?? "")
  const { data: comments, isLoading: commentsLoading } = useComments(id ?? "")
  const deletePost = useDeletePost()

  async function handleDelete() {
    if (!confirm("Delete this post permanently?")) return
    await deletePost.mutateAsync(post!.id)
    navigate("/")
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold">Post not found</h2>
        <p className="text-muted-foreground mt-2">This post may have been deleted.</p>
      </div>
    )
  }

  return (
    <article className="max-w-3xl mx-auto">
      <div className="flex gap-4">
        <VoteButton
          postId={post.id}
          voteCount={post.vote_count}
          userVote={post.user_vote}
        />

        <div className="flex-1 min-w-0">
          {post.category && (
            <span
              className="inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-2"
              style={{ backgroundColor: post.category.color + "20", color: post.category.color }}
            >
              {post.category.name}
            </span>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-start justify-between gap-2">
            <h1 className="text-2xl font-bold">{post.title}</h1>

            {(user?.id === post.user_id || profile?.is_admin) && (
              <div className="flex items-center gap-1 shrink-0">
                {user?.id === post.user_id && (
                  <Link to={`/post/${post.id}/edit`}>
                    <Button variant="ghost" size="icon" title="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete"
                  onClick={handleDelete}
                  disabled={deletePost.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2 mb-6">
            <Link
              to={`/profile/${post.author?.username}`}
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <UserAvatar
                username={post.author?.username ?? "?"}
                avatarUrl={post.author?.avatar_url ?? null}
                size="sm"
              />
              {post.author?.username}
              {post.author?.rank && (
                <span
                  className="text-[10px] font-semibold px-1 py-0.5 rounded"
                  style={{ backgroundColor: rankColors[post.author.rank as UserRank] + "20", color: rankColors[post.author.rank as UserRank] }}
                >
                  {rankLabels[post.author.rank as UserRank]}
                </span>
              )}
            </Link>
            <span>
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post.comment_count} comments
            </span>
            <ReportButton contentType="post" contentId={post.id} />
          </div>

          <div className="border-t pt-6">
            <MarkdownRenderer content={post.content} />
          </div>

          <div className="border-t mt-8 pt-6">
            <h2 className="text-lg font-semibold mb-4">
              Comments ({post.comment_count})
            </h2>

            <div className="mb-6">
              <CommentForm postId={post.id} />
            </div>

            {commentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : comments && comments.length > 0 ? (
              <CommentThread comments={comments} postId={post.id} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

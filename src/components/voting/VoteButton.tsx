import { useAuth } from "@/providers/AuthProvider"
import { useVote } from "@/hooks/useVotes"
import { SignInButton } from "@/components/auth/SignInButton"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface VoteButtonProps {
  postId: string
  voteCount: number
  userVote?: number | null
}

export function VoteButton({ postId, voteCount, userVote }: VoteButtonProps) {
  const { user } = useAuth()
  const vote = useVote()

  function handleVote(voteType: 1 | -1) {
    if (!user) return
    vote.mutate({ postId, voteType })
  }

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
      <button
        onClick={() => handleVote(1)}
        disabled={!user || vote.isPending}
        className={cn(
          "p-1 rounded transition-colors",
          userVote === 1
            ? "text-orange-500"
            : "text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10",
          !user && "cursor-default"
        )}
        title="Upvote"
      >
        <ChevronUp className="h-5 w-5" />
      </button>

      <span
        className={cn(
          "text-sm font-semibold tabular-nums",
          userVote === 1 && "text-orange-500",
          userVote === -1 && "text-blue-500"
        )}
      >
        {voteCount}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={!user || vote.isPending}
        className={cn(
          "p-1 rounded transition-colors",
          userVote === -1
            ? "text-blue-500"
            : "text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10",
          !user && "cursor-default"
        )}
        title="Downvote"
      >
        <ChevronDown className="h-5 w-5" />
      </button>

      {!user && (
        <div className="relative group">
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
            <div className="bg-popover text-popover-foreground border rounded-lg p-2 shadow-lg whitespace-nowrap">
              <SignInButton />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

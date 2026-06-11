import { useState } from "react"
import { usePosts } from "@/hooks/usePosts"
import { PostCard } from "@/components/posts/PostCard"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import type { SortOption } from "@/types"

const sortTabs: { label: string; value: SortOption }[] = [
  { label: "Hot", value: "hot" },
  { label: "Top", value: "top" },
  { label: "New", value: "new" },
]

export function Home() {
  const [sort, setSort] = useState<SortOption>("hot")
  const { data: posts, isLoading } = usePosts(sort)

  return (
    <div>
      <div className="flex items-center gap-1 mb-6 border-b">
        {sortTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSort(tab.value)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-[1px]",
              sort === tab.value
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="space-y-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold">No posts yet</h2>
          <p className="text-muted-foreground mt-2">
            Be the first to start a discussion.
          </p>
        </div>
      )}
    </div>
  )
}

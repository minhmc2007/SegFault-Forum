import { useSearchParams } from "react-router-dom"
import { useSearch } from "@/hooks/useSearch"
import { PostCard } from "@/components/posts/PostCard"
import { Loader2, Search as SearchIcon } from "lucide-react"

export function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get("q") ?? ""
  const { data: posts, isLoading } = useSearch(query)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Search</h1>
      {query && (
        <p className="text-muted-foreground mb-6">
          Results for "<span className="font-medium">{query}</span>"
        </p>
      )}

      {!query ? (
        <div className="text-center py-20">
          <SearchIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold">Search posts</h2>
          <p className="text-muted-foreground mt-2">
            Use the search bar in the header to find posts.
          </p>
        </div>
      ) : isLoading ? (
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
          <h2 className="text-xl font-semibold">No results</h2>
          <p className="text-muted-foreground mt-2">
            No posts match "{query}". Try different keywords.
          </p>
        </div>
      )}
    </div>
  )
}

import { useQuery } from "@tanstack/react-query"
import { ExternalLink, GitCommit } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

const GH_REPO = "minhmc2007/SegFault-Forum"

interface Commit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  html_url: string
  author: { login: string; avatar_url: string } | null
}

export function ChangelogPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["gh-commits"],
    queryFn: async () => {
      const res = await fetch(
        `https://api.github.com/repos/${GH_REPO}/commits?per_page=30`
      )
      if (!res.ok) throw new Error("Failed to fetch commits")
      return res.json() as Promise<Commit[]>
    },
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Changelog</h1>

      {isLoading && <p className="text-muted-foreground">Loading commits...</p>}
      {error && <p className="text-destructive">Failed to load changelog</p>}

      {data && (
        <div className="space-y-3">
          {data.map((commit) => {
            const msg = commit.commit.message.split("\n")[0]
            return (
              <div key={commit.sha} className="flex gap-3 p-3 border rounded-lg bg-card">
                <GitCommit className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{msg}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{commit.commit.author.name}</span>
                    <span>&middot;</span>
                    <span>
                      {formatDistanceToNow(new Date(commit.commit.author.date), { addSuffix: true })}
                    </span>
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 hover:text-primary transition-colors"
                    >
                      {commit.sha.slice(0, 7)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { useQuery } from "@tanstack/react-query"
import { ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"

const GH_REPO = "minhmc2007/SegFault-Forum"
const GH_WORKFLOW_ID = 293949320
const SITE_URL = "https://minhmc2007.github.io/SegFault-Forum/"

type WorkflowStatus = "queued" | "in_progress" | "completed"
type WorkflowConclusion = "success" | "failure" | "cancelled" | "skipped" | null

interface WorkflowRun {
  status: WorkflowStatus
  conclusion: WorkflowConclusion
  html_url: string
  display_title: string
  run_number: number
  created_at: string
  updated_at: string
  head_branch: string
}

function statusColor(status: WorkflowStatus, conclusion: WorkflowConclusion) {
  if (status === "in_progress") return "bg-yellow-500"
  if (status === "queued") return "bg-blue-400"
  if (conclusion === "success") return "bg-green-500"
  if (conclusion === "failure") return "bg-red-500"
  if (conclusion === "cancelled") return "bg-gray-400"
  return "bg-gray-300"
}

function statusLabel(status: WorkflowStatus, conclusion: WorkflowConclusion): string {
  if (status === "in_progress") return "Building..."
  if (status === "queued") return "Queued"
  if (conclusion === "success") return "Success"
  if (conclusion === "failure") return "Failed"
  if (conclusion === "cancelled") return "Cancelled"
  return "Unknown"
}

export function StatusPage() {
  const deploy = useQuery({
    queryKey: ["gh-deploy-status"],
    queryFn: async () => {
      const res = await fetch(
        `https://api.github.com/repos/${GH_REPO}/actions/workflows/${GH_WORKFLOW_ID}/runs?per_page=1&branch=main`
      )
      const json = await res.json()
      const run = json.workflow_runs?.[0] as WorkflowRun | undefined
      if (!run) throw new Error("No runs found")
      return run
    },
    refetchInterval: 30_000,
  })

  const site = useQuery({
    queryKey: ["gh-pages-status"],
    queryFn: async () => {
      const res = await fetch(SITE_URL, { method: "HEAD" })
      return { ok: res.ok, status: res.status }
    },
    refetchInterval: 60_000,
    retry: false,
  })

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">System Status</h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">GitHub Actions — Deploy</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { deploy.refetch(); site.refetch() }}
              disabled={deploy.isFetching}
            >
              <RefreshCw className={`h-4 w-4 ${deploy.isFetching ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {deploy.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : deploy.error ? (
            <p className="text-sm text-destructive">Failed to fetch deploy status</p>
          ) : deploy.data ? (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${statusColor(deploy.data.status, deploy.data.conclusion)}`}
                />
                <span className="font-medium">{statusLabel(deploy.data.status, deploy.data.conclusion)}</span>
                <span className="text-muted-foreground">
                  — run #{deploy.data.run_number}
                </span>
              </div>
              <p className="text-muted-foreground text-xs truncate">{deploy.data.display_title}</p>
              <p className="text-muted-foreground text-xs">
                Branch: {deploy.data.head_branch} &middot;{" "}
                {formatDistanceToNow(new Date(deploy.data.updated_at), { addSuffix: true })}
              </p>
              <a
                href={deploy.data.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View on GitHub <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : null}
        </div>

        <div className="border rounded-lg p-4 bg-card">
          <h2 className="font-semibold mb-3">GitHub Pages (Site)</h2>
          {site.isLoading ? (
            <p className="text-sm text-muted-foreground">Checking...</p>
          ) : site.error ? (
            <p className="text-sm text-destructive">Site unreachable</p>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${site.data?.ok ? "bg-green-500" : "bg-red-500"}`}
                />
                <span className="font-medium">{site.data?.ok ? "Online" : "Error"}</span>
                {site.data && <span className="text-muted-foreground">(HTTP {site.data.status})</span>}
              </div>
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {SITE_URL} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { useCreateReport } from "@/hooks/useReports"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Flag, Loader2 } from "lucide-react"

interface ReportButtonProps {
  contentType: "post" | "comment" | "profile"
  contentId: string
}

export function ReportButton({ contentType, contentId }: ReportButtonProps) {
  const { user } = useAuth()
  const report = useCreateReport()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return
    await report.mutateAsync(
      { content_type: contentType, content_id: contentId, reason: reason.trim() },
      { onSuccess: () => { setOpen(false); setReason("") } },
    )
  }

  if (!user) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
      >
        <Flag className="h-3 w-3" />
        Report
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 p-3 rounded-lg border bg-card shadow-lg z-50">
          <form onSubmit={handleSubmit} className="space-y-2">
            <p className="text-xs font-medium">Report this {contentType}</p>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you reporting this?"
              rows={3}
              className="text-xs"
              required
            />
            <div className="flex justify-end gap-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!reason.trim() || report.isPending}>
                {report.isPending && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Submit
              </Button>
            </div>
          </form>
          {report.isSuccess && <p className="text-xs text-green-600 mt-1">Report submitted</p>}
        </div>
      )}
    </div>
  )
}
